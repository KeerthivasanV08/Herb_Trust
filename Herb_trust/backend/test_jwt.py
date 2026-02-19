#!/usr/bin/env python
"""
Test script to decode JWT token header and see the algorithm used.
Usage: python test_jwt.py <JWT_TOKEN>
"""
import sys
import json
import base64

def decode_jwt_header(token):
    """Decode JWT header without verification."""
    try:
        # Split token into parts
        parts = token.split('.')
        if len(parts) != 3:
            print("Error: Invalid JWT token format (should have 3 parts)")
            return None
        
        # Get header (first part)
        header_data = parts[0]
        
        # Add padding if needed
        padding = 4 - len(header_data) % 4
        if padding != 4:
            header_data += '=' * padding
        
        # Decode base64
        decoded_header = base64.urlsafe_b64decode(header_data)
        header = json.loads(decoded_header)
        
        print("JWT Token Header:")
        print(json.dumps(header, indent=2))
        print(f"\nAlgorithm: {header.get('alg')}")
        
        # Decode payload (second part) - don't verify signature
        payload_data = parts[1]
        padding = 4 - len(payload_data) % 4
        if padding != 4:
            payload_data += '=' * padding
        
        decoded_payload = base64.urlsafe_b64decode(payload_data)
        payload = json.loads(decoded_payload)
        
        print("\nJWT Token Payload (sample):")
        print(f"  sub: {payload.get('sub')}")
        print(f"  email: {payload.get('email')}")
        print(f"  exp: {payload.get('exp')}")
        
        return header
        
    except Exception as e:
        print(f"Error decoding JWT: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_jwt.py <JWT_TOKEN>")
        print("\nOr paste your token when prompted:")
        token = input("JWT Token: ").strip()
    else:
        token = sys.argv[1].strip()
    
    if token:
        decode_jwt_header(token)
    else:
        print("Error: No token provided")
