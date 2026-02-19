import { ReactNode } from 'react';
import { useAuth, UserRole } from '@/contexts/AuthContext';

// TEMP AUTH DISABLED FOR EVALUATION – RESTORE SUPABASE AFTER DEMO

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  // AUTH DISABLED: Just render children without any protection
  // All routes are accessible without authentication
  return <>{children}</>;
}
