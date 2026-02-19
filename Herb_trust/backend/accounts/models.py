from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ("farmer", "Farmer"),
        ("manufacturer", "Manufacturer"),
        ("auditor", "Auditor"),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES)


class UserProfile(models.Model):
    """
    Profile for Supabase users.
    Stores user details linked by supabase_id.
    """
    ROLE_CHOICES = (
        ("farmer", "Farmer"),
        ("manufacturer", "Manufacturer"),
        ("auditor", "Auditor"),
    )

    supabase_id = models.CharField(max_length=255, unique=True, primary_key=True)
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="farmer")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.role})"

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"
