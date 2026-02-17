from rest_framework import viewsets
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated

from ai_engine.services import verify_herb
from compliance.services import (
    compliance_decision,
    generate_hash,
    predict_potency,
    validate_location,
)

from .models import Batch
from .serializers import BatchSerializer


class BatchViewSet(viewsets.ModelViewSet):
    queryset = Batch.objects.all()
    serializer_class = BatchSerializer
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        batch = serializer.save(farmer=self.request.user)

        # AI authenticity
        auth_score = verify_herb(batch.image.path)

        # Geo validation
        geo_valid = validate_location(
            batch.latitude,
            batch.longitude,
            batch.herb_type,
        )

        # Digital twin potency
        potency = predict_potency(batch.harvest_date)

        # Compliance decision
        decision = compliance_decision(
            auth_score,
            geo_valid,
            potency,
        )

        # Blockchain hash
        hash_value = generate_hash(
            {
                "auth_score": auth_score,
                "geo_valid": geo_valid,
                "potency": potency,
                "decision": decision,
            }
        )

        # Save results
        batch.authenticity_score = auth_score
        batch.geo_valid = geo_valid
        batch.potency_score = potency
        batch.compliance_status = decision
        batch.blockchain_hash = hash_value

        batch.save()

