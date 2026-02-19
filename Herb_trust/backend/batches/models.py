from django.db import models


class Batch(models.Model):
    HERB_CHOICES = [
        ("Ashwagandha", "Ashwagandha"),
        ("Tulsi", "Tulsi"),
    ]

    # Store Supabase user ID directly instead of ForeignKey to User model
    farmer_id = models.CharField(max_length=255, help_text="Supabase user ID", default="unknown")

    herb_type = models.CharField(max_length=100, choices=HERB_CHOICES)
    harvest_date = models.DateField()

    latitude = models.FloatField()
    longitude = models.FloatField()
    region = models.CharField(max_length=255, null=True, blank=True)

    image = models.ImageField(upload_to="batches/")

    # AI + Compliance Results
    authenticity_score = models.FloatField(null=True, blank=True)
    geo_valid = models.BooleanField(null=True, blank=True)
    potency_score = models.FloatField(null=True, blank=True)

    compliance_status = models.CharField(max_length=50, null=True, blank=True)
    blockchain_hash = models.CharField(max_length=256, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.herb_type} - {self.farmer_id}"
