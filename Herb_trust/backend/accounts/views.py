from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import UserProfile
from .serializers import UserProfileSerializer


class UserProfileViewSet(viewsets.ViewSet):
    """
    API endpoints for user profiles.
    """
    permission_classes = [IsAuthenticated]

    def get_user_id_from_auth(self):
        """Extract user ID from Supabase JWT."""
        # From Supabase JWT, the user ID is in the 'sub' claim (stored as 'id' in our SupabaseUser object)
        request = self.request
        if hasattr(request, 'user') and hasattr(request.user, 'id'):
            return request.user.id
        return None

    @action(detail=False, methods=['get', 'post'], url_path='profile')
    def profile(self, request):
        """
        Get or create/update user profile.
        POST: Create or update profile with role
        GET: Retrieve current user's profile
        """
        user_id = self.get_user_id_from_auth()
        if not user_id:
            return Response(
                {"detail": "Could not determine user ID from authentication token"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if request.method == 'GET':
            try:
                profile = UserProfile.objects.get(supabase_id=user_id)
                serializer = UserProfileSerializer(profile)
                return Response(serializer.data)
            except UserProfile.DoesNotExist:
                return Response(
                    {"detail": "Profile not found"},
                    status=status.HTTP_404_NOT_FOUND
                )

        elif request.method == 'POST':
            # Prepare data with supabase_id from authenticated user
            data = request.data.copy()
            data['supabase_id'] = user_id

            # Get or create profile
            profile, created = UserProfile.objects.get_or_create(
                supabase_id=user_id,
                defaults={
                    'email': data.get('email', ''),
                    'name': data.get('name', ''),
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
                # Profile was just created, validate and return
                serializer = UserProfileSerializer(profile)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
