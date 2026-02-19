from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import UserProfile
from .serializers import UserProfileSerializer

# TEMP AUTH DISABLED FOR EVALUATION – RESTORE SUPABASE AFTER DEMO


class UserProfileViewSet(viewsets.ViewSet):
    """
    API endpoints for user profiles.
    AUTH DISABLED for evaluation mode.
    """
    permission_classes = [AllowAny]

    def get_user_id_from_auth(self):
        """Generate a user ID for evaluation mode."""
        # In evaluation mode, generate unique user ID
        import time
        return f"eval-user-{int(time.time())}"

    @action(detail=False, methods=['get', 'post'], url_path='profile')
    def profile(self, request):
        """
        Get or create/update user profile.
        AUTH DISABLED for evaluation mode.
        """
        user_id = self.get_user_id_from_auth()

        if request.method == 'GET':
            try:
                profile = UserProfile.objects.get(supabase_id=user_id)
                serializer = UserProfileSerializer(profile)
                return Response(serializer.data)
            except UserProfile.DoesNotExist:
                # Return default profile for evaluation
                eval_profile = {
                    'id': user_id,
                    'supabase_id': user_id,
                    'email': request.data.get('email', 'evaluation@herbtrust.com'),
                    'name': request.data.get('name', 'Evaluation User'),
                    'role': request.data.get('role', 'farmer'),
                }
                return Response(eval_profile, status=status.HTTP_200_OK)

        elif request.method == 'POST':
            # Prepare data
            data = request.data.copy()
            data['supabase_id'] = user_id

            # Get or create profile
            profile, created = UserProfile.objects.get_or_create(
                supabase_id=user_id,
                defaults={
                    'email': data.get('email', 'evaluation@herbtrust.com'),
                    'name': data.get('name', 'Evaluation User'),
                    'role': data.get('role', 'farmer'),
                }
            )

            # If profile already exists, update it
            if not created:
                serializer = UserProfileSerializer(profile, data=data, partial=True)
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data, status=status.HTTP_200_OK)
                else:
                    return Response(
                        serializer.errors,
                        status=status.HTTP_400_BAD_REQUEST
                    )
            else:
                # Profile was just created
                serializer = UserProfileSerializer(profile)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
