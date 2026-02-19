from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from io import BytesIO
from datetime import datetime

# TEMP AUTH DISABLED FOR EVALUATION – RESTORE SUPABASE AFTER DEMO

from ai_engine.services import verify_herb
from compliance.services import (
    compliance_decision,
    generate_hash,
    predict_potency,
    validate_location,
)

from .models import Batch
from .serializers import BatchSerializer, BatchGeoSerializer
from .certificate import generate_certificate_pdf


class BatchViewSet(viewsets.ModelViewSet):
    queryset = Batch.objects.all()
    serializer_class = BatchSerializer
    permission_classes = [AllowAny]  # AUTH DISABLED

    def get_permissions(self):
        """Allow all requests without authentication."""
        return [AllowAny()]

    def perform_create(self, serializer):
        # Generate unique farmer ID for evaluation mode
        farmer_id = f"eval-user-{int(datetime.now().timestamp())}"
        batch = serializer.save(farmer_id=farmer_id)

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

    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def certificate(self, request, pk=None):
        """Generate and return a PDF certificate for an approved batch."""
        # Use get_object_or_404 for robust error handling
        batch = get_object_or_404(self.get_queryset(), pk=pk)

        # Check if approved (prevent certificate generation for non-approved batches)
        if batch.compliance_status != 'Approved':
            return Response(
                {'error': 'Certificate available only for approved batches'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Generate PDF
            pdf_buffer = generate_certificate_pdf(batch)
            
            # Return as attachment with production-safe headers
            response = HttpResponse(pdf_buffer, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="certificate_{batch.id}.pdf"'
            response['Cache-Control'] = 'no-store'
            return response
        except Exception as e:
            return Response(
                {'error': f'Failed to generate certificate: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def geo_data(self, request):
        """
        Return lightweight geo-location data for compliance map.
        Accessible to auditors (with authentication).
        Returns empty list for unauthenticated or non-auditor users.
        """
        # Check if user is authenticated and is an auditor
        if not request.user or not hasattr(request.user, 'is_authenticated') or not request.user.is_authenticated:
            # Return empty list for unauthenticated users
            return Response([])
        
        if not hasattr(request.user, 'role') or request.user.role != 'auditor':
            # Return empty list for non-auditors
            return Response([])

        # Get batches with valid coordinates
        batches = Batch.objects.filter(
            latitude__isnull=False,
            longitude__isnull=False
        ).order_by('-created_at')

        serializer = BatchGeoSerializer(batches, many=True)
        return Response(serializer.data)

