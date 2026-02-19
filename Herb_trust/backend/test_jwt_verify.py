#!/usr/bin/env python
"""
Test JWT verification with the actual Supabase JWT secret.
This will help diagnose JWT verification issues.
"""
import os
import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

# Load environment variables
env_file = backend_dir / ".env"
if env_file.exists():
    for line in env_file.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        key, value = stripped.split("=", 1)
        os.environ.setdefault(key, value.strip().strip('"').strip("'"))

from jose import jwt, JWTError

def test_jwt_verification(token):
    """Test JWT token verification."""
    jwt_secret = os.getenv("SUPABASE_JWT_SECRET")
    
    if not jwt_secret:
        print("ERROR: SUPABASE_JWT_SECRET not found in environment")
        return
    
    print(f"JWT Secret (first 20 chars): {jwt_secret[:20]}...")
    print(f"JWT Secret length: {len(jwt_secret)} characters")
    print()
    
    # Try different algorithm configurations
    algorithms_to_try = [
        ['HS256'],
        ['HS256', 'HS384', 'HS512'],
        ['HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512'],
    ]
    
    for algs in algorithms_to_try:
        print(f"Trying algorithms: {algs}")
        try:
            payload = jwt.decode(
                token,
                jwt_secret,
                algorithms=algs,
                options={
                    'verify_signature': True,
                    'verify_exp': True,
                    'verify_aud': False,
                }
            )
            print(f"✓ SUCCESS with algorithms: {algs}")
            print(f"  Payload sub: {payload.get('sub')}")
            print(f"  Payload email: {payload.get('email')}")
            print(f"  Payload role: {payload.get('role')}")
            print()
            return payload
        except jwt.ExpiredSignatureError as e:
            print(f"✗ EXPIRED: {e}")
        except jwt.JWTClaimsError as e:
            print(f"✗ CLAIMS ERROR: {e}")
        except JWTError as e:
            print(f"✗ JWT ERROR: {e}")
        except Exception as e:
            print(f"✗ UNEXPECTED ERROR: {type(e).__name__}: {e}")
        print()
    
    print("All algorithm combinations failed!")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_jwt_verify.py <JWT_TOKEN>")
        print("\nOr paste your token when prompted:")
        token = input("JWT Token: ").strip()
    else:
        token = sys.argv[1].strip()
    
    if token:
        test_jwt_verification(token)
    else:
        print("Error: No token provided")
