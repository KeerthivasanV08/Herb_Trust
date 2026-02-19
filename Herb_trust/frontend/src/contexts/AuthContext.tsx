import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { syncUserProfileToBackend, getBackendUserProfile } from '@/services/api';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export type UserRole = 'farmer' | 'manufacturer' | 'auditor';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and subscribe to auth changes
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('Session found, fetching profile from backend');
          try {
            const profile = await getBackendUserProfile();
            console.log('Backend profile fetched:', profile);
            setUser({
              id: profile.id,
              email: profile.email,
              name: profile.name,
              role: profile.role as UserRole,
            });
          } catch (error) {
            console.error('Failed to fetch profile from backend:', error);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('Auth state changed to SIGNED_IN, fetching profile from backend');
        try {
          const profile = await getBackendUserProfile();
          console.log('Backend profile fetched:', profile);
          setUser({
            id: profile.id,
            email: profile.email,
            name: profile.name,
            role: profile.role as UserRole,
          });
        } catch (error) {
          console.error('Failed to fetch profile from backend:', error);
          setUser(null);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const trimmedEmail = email.trim();
      if (!trimmedEmail) {
        throw new Error('Email is required.');
      }

      console.log('Attempting login for:', trimmedEmail);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        console.error('Supabase auth error:', error);
        throw error;
      }

      console.log('Supabase auth successful, user ID:', data.user?.id);

      const accessToken = data.session?.access_token || null;
      if (accessToken) {
        localStorage.setItem('supabase_access_token', accessToken);
      }

      if (data.user) {
        console.log('Fetching user profile from backend...');
        
        try {
          // Fetch profile from backend
          const backendProfile = await getBackendUserProfile();
          console.log('Backend profile fetched:', backendProfile);
          
          const userData: User = {
            id: backendProfile.id,
            email: backendProfile.email,
            name: backendProfile.name,
            role: backendProfile.role as UserRole,
          };
          
          console.log('Setting user in AuthContext:', userData);
          setUser(userData);
          console.log('Login successful, user state updated');
        } catch (profileError: any) {
          console.error('Failed to fetch backend profile:', profileError);
          // Profile might not exist yet, but auth succeeded - set minimal user
          if (data.user.email) {
            const minimalUser: User = {
              id: data.user.id,
              email: data.user.email,
              name: data.user.email?.split('@')[0] || 'User',
              role: 'farmer' as UserRole,
            };
            console.log('Setting minimal user from auth:', minimalUser);
            setUser(minimalUser);
          } else {
            await supabase.auth.signOut();
            throw new Error('Profile not found. Please sign up first.');
          }
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Failed to login');
    }
  };

  const signup = async (name: string, email: string, password: string, role: UserRole) => {
    try {
      const trimmedEmail = email.trim();
      const trimmedName = name.trim();
      if (!trimmedEmail) {
        throw new Error('Email is required.');
      }

      // Sign up the user with Supabase auth
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const session = data.session || (await supabase.auth.getSession()).data.session;
        const accessToken = session?.access_token || null;
        if (accessToken) {
          localStorage.setItem('supabase_access_token', accessToken);
        }

        // Create profile on backend
        try {
          console.log('Creating profile on backend:', { email: data.user.email, name: trimmedName, role });
          const backendProfile = await syncUserProfileToBackend({
            email: data.user.email || trimmedEmail,
            name: trimmedName || 'User',
            role,
          });
          console.log('Backend profile created successfully:', backendProfile);
          
          const userData: User = {
            id: backendProfile.id,
            email: backendProfile.email,
            name: backendProfile.name,
            role: backendProfile.role as UserRole,
          };
          
          console.log('Setting user in AuthContext after signup:', userData);
          setUser(userData);
          console.log('Signup successful, user state updated');
        } catch (syncError: any) {
          console.error('Failed to create profile on backend:', syncError);
          // Clean up auth user if profile creation fails
          await supabase.auth.signOut();
          throw new Error(`Failed to create profile: ${syncError.message || 'Unknown error'}`);
        }
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'Failed to signup');
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      try {
        localStorage.removeItem('supabase_access_token');
        localStorage.removeItem('sb-auth-token');
      } catch {
        // localStorage might be blocked, continue anyway
      }
      setUser(null);
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error(error.message || 'Failed to logout');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      signup,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
