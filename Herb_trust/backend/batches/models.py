from django.db import models
from django.conf import settings


class Batch(models.Model):
    HERB_CHOICES = [
        ("Ashwagandha", "Ashwagandha"),
        ("Tulsi", "Tulsi"),
    ]

    farmer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    herb_type = models.CharField(max_length=100, choices=HERB_CHOICES)
    harvest_date = models.DateField()

    latitude = models.FloatField()
    longitude = models.FloatField()

    image = models.ImageField(upload_to="batches/")

    # AI + Compliance Results
    authenticity_score = models.FloatField(null=True, blank=True)
    geo_valid = models.BooleanField(null=True, blank=True)
    potency_score = models.FloatField(null=True, blank=True)

    compliance_status = models.CharField(max_length=50, null=True, blank=True)
    blockchain_hash = models.CharField(max_length=256, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.herb_type} - {self.farmer.username}"
