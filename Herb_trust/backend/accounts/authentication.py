"""
Supabase JWT Authentication for Django REST Framework

This module provides JWT token verification for Supabase-authenticated users.
"""
import os
import jwt as pyjwt
from rest_framework import authentication, exceptions
from django.conf import settings


class SupabaseAuthentication(authentication.BaseAuthentication):
    """
    Custom authentication class for Supabase JWT tokens.
    
    Verifies the JWT token sent in the Authorization header
    and extracts user information from the token payload.
    """
    
    def authenticate(self, request):
        """
        Authenticate the request using Supabase JWT token.
        
        Returns:
            tuple: (user_data, None) if authentication successful
            None: if no authentication attempted
            
        Raises:
            AuthenticationFailed: if authentication fails
        """
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header:
            return None  # No authentication attempted
        
        try:
            # Extract token from "Bearer <token>"
            parts = auth_header.split()
            
            if len(parts) != 2 or parts[0].lower() != 'bearer':
                raise exceptions.AuthenticationFailed('Invalid authorization header format')
            
            token = parts[1]
            
            # Verify and decode the JWT token
            payload = self._verify_token(token)
            
            # Extract user information from token payload
            user_data = self._extract_user_data(payload)
            
            return (user_data, None)
            
        except pyjwt.PyJWTError as e:
            raise exceptions.AuthenticationFailed(f'Invalid token: {str(e)}')
        except Exception as e:
            raise exceptions.AuthenticationFailed(f'Authentication failed: {str(e)}')
    
    def _verify_token(self, token):
        """
        Verify the JWT token using Supabase JWT secret.
        
        Args:
            token (str): JWT token to verify
            
        Returns:
            dict: Decoded token payload
            
        Raises:
            JWTError: if token verification fails
        """
        jwt_secret = getattr(settings, 'SUPABASE_JWT_SECRET', None)
        
        if not jwt_secret:
            raise exceptions.AuthenticationFailed(
                'SUPABASE_JWT_SECRET not configured in settings'
            )
        
        # Debug: Decode token header without verification to see the algorithm
        try:
            import json
            import base64
            header_data = token.split('.')[0]
            # Add padding if needed
            padding = 4 - len(header_data) % 4
            if padding != 4:
                header_data += '=' * padding
            decoded_header = base64.urlsafe_b64decode(header_data)
            header = json.loads(decoded_header)
            print(f"DEBUG: Token algorithm: {header.get('alg')}")
        except Exception as e:
            print(f"DEBUG: Failed to decode token header: {e}")
        
        try:
            payload = pyjwt.decode(
                token,
                jwt_secret,
                algorithms=['HS256', 'HS384', 'HS512'],
                options={
                    'verify_signature': True,
                    'verify_exp': True,
                }
            )
            return payload
        except pyjwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed('Token has expired')
        except pyjwt.InvalidTokenError as e:
            raise exceptions.AuthenticationFailed(f'Token verification failed: {str(e)}')
    
    def _extract_user_data(self, payload):
        """
        Extract user data from JWT payload.
        
        Args:
            payload (dict): Decoded JWT payload
            
        Returns:
            dict: User information
        """
        # Supabase JWT payload structure
        user_id = payload.get('sub')  # Subject claim contains user ID
        email = payload.get('email')
        role = payload.get('user_metadata', {}).get('role') or payload.get('role')
        
        # Try to get role from app_metadata if not in user_metadata
        if not role:
            role = payload.get('app_metadata', {}).get('role')
        
        if not user_id:
            raise exceptions.AuthenticationFailed('Token missing user ID (sub claim)')
        
        # Create a user-like object with the data we need
        user_data = {
            'id': user_id,
            'email': email,
            'role': role,
            'is_authenticated': True,
        }
        
        return type('SupabaseUser', (), user_data)
