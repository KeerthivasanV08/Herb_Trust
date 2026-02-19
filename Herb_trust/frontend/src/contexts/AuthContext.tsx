import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// TEMP AUTH DISABLED FOR EVALUATION – RESTORE SUPABASE AFTER DEMO

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
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USER_STORAGE_KEY = 'mockUser';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On app load, check localStorage for mock user
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(MOCK_USER_STORAGE_KEY);
      if (storedUser) {
        const mockUser = JSON.parse(storedUser);
        console.log('Mock user loaded from localStorage:', mockUser);
        setUser(mockUser);
      }
    } catch (error) {
      console.error('Error loading mock user:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string, role: UserRole = 'farmer') => {
    try {
      const trimmedEmail = email.trim();
      if (!trimmedEmail) {
        throw new Error('Email is required.');
      }

      console.log('Mock login attempt for:', trimmedEmail, 'role:', role);

      // Create mock user object
      const mockUser: User = {
        id: `user-${Date.now()}`,
        email: trimmedEmail,
        name: trimmedEmail.split('@')[0] || 'User',
        role: role,
      };

      // Store in localStorage
      localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(mockUser));
      console.log('Mock user stored:', mockUser);

      setUser(mockUser);
      console.log('Mock login successful');
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

      console.log('Mock signup attempt for:', trimmedEmail, 'role:', role);

      // Create mock user object
      const mockUser: User = {
        id: `user-${Date.now()}`,
        email: trimmedEmail,
        name: trimmedName || trimmedEmail.split('@')[0] || 'User',
        role: role,
      };

      // Store in localStorage
      localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(mockUser));
      console.log('Mock user stored:', mockUser);

      setUser(mockUser);
      console.log('Mock signup successful');
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'Failed to signup');
    }
  };

  const logout = async () => {
    try {
      console.log('Mock logout');
      localStorage.removeItem(MOCK_USER_STORAGE_KEY);
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
