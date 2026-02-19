from rest_framework import serializers
from .models import UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    # Return supabase_id as 'id' for API responses
    id = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProfile
        fields = ['id', 'email', 'name', 'role', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_id(self, obj):
        """Return supabase_id as id for API responses"""
        return obj.supabase_id
