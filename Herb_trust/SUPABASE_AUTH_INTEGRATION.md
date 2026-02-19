# Supabase Authentication Integration Guide

## Overview

This guide documents the Supabase authentication integration with Django backend and React frontend. The system uses JWT tokens for authentication and implements role-based access control for three user types: farmers, manufacturers, and auditors.

## Architecture

### Frontend (React + TypeScript + Vite)
- **Authentication**: Supabase Auth with `@supabase/supabase-js`
- **Token Management**: JWT access tokens stored in Supabase session
- **Authorization**: Bearer token sent in `Authorization` header for API requests

### Backend (Django + DRF)
- **Authentication**: Custom `SupabaseAuthentication` class
- **Token Verification**: `python-jose` library verifies JWT signatures
- **User Model**: Supabase user IDs stored directly (no Django User objects)

## Setup Instructions

### 1. Supabase Project Setup

#### 1.1 Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Note down:
   - Project URL: `https://your-project.supabase.co`
   - Anon/Public Key: `eyJhbGci...`
   - JWT Secret: Found in Settings > API > JWT Secret

#### 1.2 Create Profiles Table

Execute this SQL in Supabase SQL Editor:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('farmer', 'manufacturer', 'auditor')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Profile will be created by the application during signup
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 2. Frontend Configuration

#### 2.1 Environment Variables

Create `.env` file in `frontend/` directory:

```env
# Backend API
VITE_API_BASE_URL=http://127.0.0.1:8000

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

#### 2.2 Dependencies

Already installed:
- `@supabase/supabase-js` - Supabase client library

#### 2.3 Key Files

**src/lib/supabase.ts**
- Supabase client initialization
- Helper functions for token and profile retrieval

**src/contexts/AuthContext.tsx**
- Authentication state management
- Login, signup, logout functions
- Automatic session refresh

**src/services/api.ts**
- Axios instance with Bearer token interceptor
- Automatic token injection for API requests

**src/pages/Auth.tsx**
- Login/signup UI
- Role selection during signup
- Auto-navigation based on user role

### 3. Backend Configuration

#### 3.1 Environment Variables

Create `.env` file in `backend/` directory:

```env
# Django Settings
SECRET_KEY=your-django-secret-key
DEBUG=True

# Database (Supabase PostgreSQL)
DB_NAME=postgres
DB_USER=postgres.yourproject
DB_PASSWORD=your-db-password
DB_HOST=db.yourproject.supabase.co
DB_PORT=6543

# Supabase JWT Secret
SUPABASE_JWT_SECRET=your-jwt-secret-here

# Frontend URL (for certificate QR codes)
FRONTEND_BASE_URL=http://localhost:5173
```

**IMPORTANT**: Get the JWT Secret from:
Supabase Dashboard → Settings → API → JWT Settings → JWT Secret

#### 3.2 Dependencies

Already installed:
```bash
pip install python-jose[cryptography] python-dotenv
```

#### 3.3 Key Files

**accounts/authentication.py**
- `SupabaseAuthentication` class
- JWT token verification using HS256 algorithm
- User data extraction from token payload

**config/settings.py**
- `SUPABASE_JWT_SECRET` configuration
- REST_FRAMEWORK settings with SupabaseAuthentication

**batches/models.py**
- Changed from `farmer` ForeignKey to `farmer_id` CharField
- Stores Supabase user UUID directly

**batches/views.py**
- Role-based access control
- Farmers can create batches
- Auditors can access geo-data
- Public can view batches (for development)

## Authentication Flow

### Signup Flow

1. **User submits signup form** (name, email, password, role)
2. **Frontend calls** `supabase.auth.signUp()`
3. **Supabase creates user** in auth.users table
4. **Frontend creates profile** in profiles table with selected role
5. **User auto-logged in** with JWT access token
6. **Redirect to role-specific dashboard**

### Login Flow

1. **User submits login form** (email, password)
2. **Frontend calls** `supabase.auth.signInWithPassword()`
3. **Supabase validates credentials** and returns session
4. **Frontend fetches user profile** from profiles table
5. **AuthContext updates** with user data including role
6. **Redirect to role-specific dashboard**

### API Request Flow

1. **User makes API request** (e.g., create batch)
2. **Axios interceptor** retrieves access token from Supabase session
3. **Token added to header** as `Authorization: Bearer <token>`
4. **Django receives request** → SupabaseAuthentication runs
5. **Token verified** using SUPABASE_JWT_SECRET and HS256
6. **User data extracted** from JWT payload (id, email, role)
7. **View checks** user role and permissions
8. **Response sent** back to frontend

## Role-Based Access Control

### Frontend (UI Level)

**Protected Routes:**
- `/farmer/*` - Farmer dashboard and pages
- `/manufacturer/*` - Manufacturer dashboard and pages
- `/auditor/*` - Auditor dashboard and pages

**ProtectedRoute Component:**
- Checks if user is authenticated
- Redirects to `/auth` if not logged in
- Shows loading state while checking authentication

### Backend (API Level)

**Batch Creation:**
```python
# Only farmers can create batches
if request.user.role != 'farmer':
    raise PermissionDenied('Only farmers can create batches')
```

**Geo-Data Access:**
```python
# Only auditors can access geo-data
if request.user.role != 'auditor':
    return Response([])  # Empty list for non-auditors
```

**Certificate Generation:**
```python
# Anyone can download certificates (AllowAny)
permission_classes = [AllowAny]
```

## Security Considerations

### ✅ Implemented

1. **JWT Secret Protection**
   - Stored in environment variable
   - Never exposed to frontend
   - Used for server-side verification only

2. **Token Expiration**
   - Supabase handles token refresh automatically
   - Frontend session auto-refreshes
   - Expired tokens rejected with 401

3. **HTTPS Required (Production)**
   - Use HTTPS for all API calls in production
   - Supabase enforces HTTPS

4. **Role Validation**
   - Backend always validates role from JWT
   - Frontend role is just for UI/UX
   - Never trust client-side role checks

### ⚠️ Recommendations

1. **Enable Email Verification**
   ```sql
   -- In Supabase Auth settings, enable email confirmation
   ```

2. **Add Rate Limiting**
   ```python
   # Add Django rate limiting for auth endpoints
   from django_ratelimit.decorators import ratelimit
   ```

3. **Implement Password Policy**
   ```javascript
   // Supabase Auth → Settings → Password Policy
   // Minimum length, complexity requirements
   ```

4. **Add Audit Logging**
   ```python
   # Log authentication attempts, role changes, etc.
   ```

## Testing

### Test Signup

1. Visit `http://localhost:5173/auth`
2. Click "Sign Up" tab
3. Fill in:
   - Name: Test Farmer
   - Email: farmer@test.com
   - Password: testpass123
   - Role: Farmer
4. Click "Sign Up"
5. Should redirect to `/farmer` dashboard

### Test Login

1. Visit `http://localhost:5173/auth`
2. Enter credentials
3. Should redirect based on role in profile

### Test API with Token

```bash
# 1. Login to get token
curl -X POST https://your-project.supabase.co/auth/v1/token?grant_type=password \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"farmer@test.com","password":"testpass123"}'

# 2. Use token for API request
curl -X GET http://127.0.0.1:8000/api/batches/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Test Role-Based Access

```bash
# As farmer, try to create batch (should succeed)
curl -X POST http://127.0.0.1:8000/api/batches/ \
  -H "Authorization: Bearer FARMER_TOKEN" \
  -F "herb_type=Tulsi" \
  -F "harvest_date=2026-02-17" \
  # ... other fields

# As manufacturer, try to create batch (should fail with 403)
curl -X POST http://127.0.0.1:8000/api/batches/ \
  -H "Authorization: Bearer MANUFACTURER_TOKEN" \
  -F "herb_type=Tulsi" \
  # ... other fields

# As auditor, access geo-data (should succeed)
curl -X GET http://127.0.0.1:8000/api/batches/geo_data/ \
  -H "Authorization: Bearer AUDITOR_TOKEN"
```

## Troubleshooting

### "Invalid token" Error

**Cause**: JWT secret mismatch or token expired

**Solution**:
1. Check SUPABASE_JWT_SECRET matches Supabase dashboard
2. Ensure token is not expired
3. Log out and log in again to get fresh token

### "SUPABASE_JWT_SECRET not set" Warning

**Cause**: Missing environment variable

**Solution**:
1. Copy `.env.example` to `.env` in backend/
2. Add `SUPABASE_JWT_SECRET=your-secret-here`
3. Restart Django server

### "Authentication credentials were not provided"

**Cause**: No token sent or frontend not configured

**Solution**:
1. Check Supabase env vars in frontend `.env`
2. Check browser console for errors
3. Verify token is present in request headers

### "Only farmers can create batches"

**Cause**: User role is not 'farmer' or not set

**Solution**:
1. Check profiles table has correct role
2. Update role:
   ```sql
   UPDATE profiles SET role = 'farmer' WHERE id = 'user-uuid';
   ```

### Database Connection Error

**Cause**: Supabase database credentials incorrect

**Solution**:
1. Get connection details from Supabase Dashboard → Settings → Database
2. Update .env with correct DB_HOST, DB_NAME, DB_USER, DB_PASSWORD
3. Port should be `6543` for Supabase pooler

## Migration from Session Auth

If migrating from Django session authentication:

1. **Backup existing users**
   ```bash
   python manage.py dumpdata accounts.User > users_backup.json
   ```

2. **Create Supabase accounts** for existing users
3. **Update farmer_id** in batches table with Supabase UUIDs
4. **Test authentication** before removing session auth

## Production Deployment

### Frontend

1. **Update .env.production**
   ```env
   VITE_API_BASE_URL=https://api.yourdomain.com
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

2. **Build**
   ```bash
   npm run build
   ```

3. **Deploy** to Vercel/Netlify/etc.

### Backend

1. **Update production .env**
   ```env
   DEBUG=False
   ALLOWED_HOSTS=api.yourdomain.com
   SUPABASE_JWT_SECRET=production-jwt-secret
   ```

2. **Collect static files**
   ```bash
   python manage.py collectstatic
   ```

3. **Use production server** (Gunicorn/uWSGI)

4. **Enable HTTPS** (required for security)

## Support

For issues or questions:
- Check Supabase logs in dashboard
- Review Django debug toolbar
- Check browser network tab for failed requests
- Verify JWT at [jwt.io](https://jwt.io)

## Changelog

- **2026-02-17**: Initial Supabase integration
  - Frontend: @supabase/supabase-js integration
  - Backend: SupabaseAuthentication class
  - Database: Changed farmer ForeignKey to farmer_id CharField
  - Migrations: 0003_change_farmer_to_farmer_id
