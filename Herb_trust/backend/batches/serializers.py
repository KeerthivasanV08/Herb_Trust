from rest_framework import serializers
from .models import Batch


class BatchSerializer(serializers.ModelSerializer):

    class Meta:
        model = Batch
        fields = [
            "id",
            "herb_type",
            "harvest_date",
            "latitude",
            "longitude",
            "image",
            "authenticity_score",
            "geo_valid",
            "potency_score",
            "compliance_status",
            "blockchain_hash",
            "created_at",
        ]

        read_only_fields = [
            "authenticity_score",
            "geo_valid",
            "potency_score",
            "compliance_status",
            "blockchain_hash",
            "created_at",
        ]
