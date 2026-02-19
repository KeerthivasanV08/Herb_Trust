"""
Demo Authentication for Django REST Framework

This module provides demo authentication for testing/demo purposes.
Uses a mock user with demo credentials.
"""
import os
import jwt as pyjwt
from rest_framework import authentication, exceptions
from django.conf import settings


class DemoAuthentication(authentication.BaseAuthentication):
    """
    Demo authentication for testing purposes.
    Accepts the demo user credentials via a simple auth token.
    """
    
    # Demo credentials - hardcoded for demo purposes
    DEMO_USER_ID = 'demo-user'
    DEMO_EMAIL = 'demo@herbtrust.com'
    DEMO_ROLE = 'farmer'
    DEMO_TOKEN = 'demo-auth-token-12345'
    
    def authenticate(self, request):
        """
        Authenticate the request using demo credentials.
        
        For demo purposes, we accept:
        1. Authorization: Bearer demo-auth-token-12345
        2. Or no auth header (returns demo user)
        
        Returns:
            tuple: (user_data, None) if authentication successful
            None: if no authentication attempted
            
        Raises:
            AuthenticationFailed: if authentication fails
        """
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        # DEMO MODE: Allow requests without auth header too
        if not auth_header:
            # Return demo user by default
            console_log = f"DEMO AUTH: No auth header, using demo user"
            print(f"[DEMO] {console_log}")
            user_data = self._create_demo_user()
            return (user_data, None)
        
        try:
            # Extract token from "Bearer <token>"
            parts = auth_header.split()
            
            if len(parts) != 2 or parts[0].lower() != 'bearer':
                raise exceptions.AuthenticationFailed('Invalid authorization header format')
            
            token = parts[1]
            
            # DEMO MODE: Accept demo token
            if token == self.DEMO_TOKEN:
                print(f"[DEMO] Valid demo token provided")
                user_data = self._create_demo_user()
                return (user_data, None)
            
            # For future compatibility, try Supabase auth if available
            try:
                payload = self._verify_token(token)
                user_data = self._extract_user_data(payload)
                return (user_data, None)
            except Exception as supabase_error:
                print(f"[DEMO] Supabase auth failed: {supabase_error}")
                raise exceptions.AuthenticationFailed(f'Invalid token: {str(supabase_error)}')
            
        except exceptions.AuthenticationFailed:
            raise
        except Exception as e:
            raise exceptions.AuthenticationFailed(f'Authentication failed: {str(e)}')
    
    def _create_demo_user(self):
        """Create a demo user object."""
        user_data = {
            'id': self.DEMO_USER_ID,
            'email': self.DEMO_EMAIL,
            'role': self.DEMO_ROLE,
            'is_authenticated': True,
        }
        return type('DemoUser', (), user_data)
    
    def _verify_token(self, token):
        """
        Verify the JWT token using Supabase JWT secret (if configured).
        Falls back to demo mode if not available.
        
        Args:
            token (str): JWT token to verify
            
        Returns:
            dict: Decoded token payload
            
        Raises:
            JWTError: if token verification fails
        """
        jwt_secret = getattr(settings, 'SUPABASE_JWT_SECRET', None)
        
        if not jwt_secret:
            # No JWT secret configured - use demo mode
            print("[DEMO] No SUPABASE_JWT_SECRET configured, using demo mode")
            raise exceptions.AuthenticationFailed(
                'SUPABASE_JWT_SECRET not configured - using demo authentication'
            )
        
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

