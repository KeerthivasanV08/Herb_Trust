import { createContext, useContext, useState, ReactNode } from 'react';

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
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('ayurtrace_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email: string, _password: string, role: UserRole) => {
    // Simulated login - in production, this would call an API
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      name: email.split('@')[0],
      role,
    };
    
    setUser(newUser);
    localStorage.setItem('ayurtrace_user', JSON.stringify(newUser));
  };

  const signup = async (name: string, email: string, _password: string, role: UserRole) => {
    // Simulated signup
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      name,
      role,
    };
    
    setUser(newUser);
    localStorage.setItem('ayurtrace_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ayurtrace_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
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
