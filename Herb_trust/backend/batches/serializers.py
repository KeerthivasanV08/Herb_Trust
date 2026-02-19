from rest_framework import serializers
from .models import Batch


class BatchSerializer(serializers.ModelSerializer):

    class Meta:
        model = Batch
        fields = [
            "id",
            "farmer_id",
            "herb_type",
            "harvest_date",
            "latitude",
            "longitude",
            "region",
            "image",
            "authenticity_score",
            "geo_valid",
            "potency_score",
            "compliance_status",
            "blockchain_hash",
            "created_at",
        ]

        read_only_fields = [
            "farmer_id",
            "authenticity_score",
            "geo_valid",
            "potency_score",
            "compliance_status",
            "blockchain_hash",
            "created_at",
        ]


class BatchGeoSerializer(serializers.ModelSerializer):
    """Lightweight serializer for geo-map data."""
    batch_id = serializers.SerializerMethodField()

    class Meta:
        model = Batch
        fields = ["id", "batch_id", "latitude", "longitude", "region", "compliance_status"]

    def get_batch_id(self, obj):
        return f"HERB-{obj.id:03d}"
