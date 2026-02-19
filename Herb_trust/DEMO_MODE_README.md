# Demo Mode - Authentication Disabled

## Overview
The application has been temporarily refactored to disable Supabase authentication for demo purposes. All authentication and authorization checks have been bypassed, and a mock user is used throughout the application.

## Changes Made

### Frontend Changes

#### 1. AuthContext (`frontend/src/contexts/AuthContext.tsx`)
- **Removed**: All Supabase authentication logic, session management, and state subscriptions
- **Added**: Mock user with fixed credentials:
  ```typescript
  {
    id: 'demo-user',
    email: 'demo@herbtrust.com',
    name: 'Demo User',
    role: 'farmer'
  }
  ```
- **Behavior**: 
  - `isAuthenticated` always returns `true`
  - `isLoading` always returns `false`
  - `login()`, `signup()`, and `logout()` are no-ops (do nothing)

#### 2. ProtectedRoute (`frontend/src/components/ProtectedRoute.tsx`)
- **Removed**: All authentication and role checks, redirects to `/auth`
- **Added**: Always renders children without any validation
- **Behavior**: All routes are now publicly accessible

#### 3. API Service (`frontend/src/services/api.ts`)
- **Removed**: JWT token retrieval from Supabase
- **Removed**: Authorization header with Bearer token
- **Behavior**: All API requests are made without authentication headers

#### 4. TopBar (`frontend/src/components/TopBar.tsx`)
- **Modified**: Logout function is now a no-op
- **Removed**: Navigation to `/auth` after logout
- **Behavior**: Logout button does nothing (user stays logged in)

### Backend Changes

#### 1. Django Settings (`backend/config/settings.py`)
- **Removed**: `SupabaseAuthentication` from `DEFAULT_AUTHENTICATION_CLASSES`
- **Changed**: `DEFAULT_PERMISSION_CLASSES` from `IsAuthenticatedOrReadOnly` to `AllowAny`
- **Behavior**: All API endpoints are now publicly accessible without authentication

#### 2. UserProfile Views (`backend/accounts/views.py`)
- **Changed**: `permission_classes` from `[IsAuthenticated]` to `[AllowAny]`
- **Modified**: `get_user_id_from_auth()` always returns `'demo-user'`
- **Added**: Returns demo profile data when profile not found in database
- **Behavior**: Profile endpoints work without authentication, always use demo user ID

#### 3. Batch Views (`backend/batches/views.py`)
- **Changed**: `permission_classes` from `[IsAuthenticated]` to `[AllowAny]`
- **Removed**: Role-based permission checks for batch creation
- **Modified**: `perform_create()` uses `'demo-user'` as farmer_id instead of authenticated user ID
- **Behavior**: Anyone can create, read, update, and delete batches

## Demo User Credentials

Throughout the application, the following mock user is used:

- **ID**: `demo-user`
- **Email**: `demo@herbtrust.com`
- **Name**: `Demo User`
- **Role**: `farmer`

## Functionality Status

### ✅ Working Without Authentication
- Dashboard access (all roles)
- Batch creation and management
- Batch verification and viewing
- Certificate generation
- AI fraud detection
- Compliance checks
- Geo-mapping features
- All protected routes

### ❌ Disabled Features
- User login
- User signup
- User logout (button visible but does nothing)
- Session management
- Token-based authentication
- Role-based access control
- User-specific data filtering

## Reverting to Production Mode

To re-enable authentication, revert the following files:

### Frontend
1. `frontend/src/contexts/AuthContext.tsx` - Restore Supabase authentication logic
2. `frontend/src/components/ProtectedRoute.tsx` - Restore auth checks and redirects
3. `frontend/src/services/api.ts` - Restore JWT token authorization
4. `frontend/src/components/TopBar.tsx` - Restore logout navigation

### Backend
1. `backend/config/settings.py` - Restore `SupabaseAuthentication` and `IsAuthenticatedOrReadOnly`
2. `backend/accounts/views.py` - Restore `IsAuthenticated` permission and real user ID extraction
3. `backend/batches/views.py` - Restore `IsAuthenticated` permission and role checks

## Testing Notes

The application is now accessible without any login requirements:
- Navigate directly to any route (e.g., `/farmer`, `/manufacturer`, `/auditor`)
- All API endpoints respond without authentication headers
- Database operations use the demo user ID for all user-related fields

## Known Limitations

1. **User Role**: All users are treated as 'farmer' role
2. **Multi-user**: Cannot test multi-user scenarios since everyone uses the same demo user
3. **Security**: This mode should NEVER be used in production
4. **Data**: All batches and profiles will be associated with 'demo-user'

## Important Security Notice

⚠️ **WARNING**: This demo mode completely disables all authentication and authorization. 
- Do NOT deploy this configuration to production
- Do NOT expose this configuration to the public internet
- This is ONLY for local demo/testing purposes

---

*Last Updated: February 19, 2026*
*Demo Mode: ENABLED*
