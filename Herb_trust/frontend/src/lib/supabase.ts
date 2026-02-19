import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

// Memory-based storage to avoid NavigatorLock timeouts
class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  get length(): number {
    return this.store.size;
  }
}

const memoryStorage = new MemoryStorage();

// Also use localStorage as a secondary storage for persistence across page reloads
const createStorageAdapter = () => {
  return {
    getItem: (key: string) => {
      try {
        return localStorage.getItem(key) ?? memoryStorage.getItem(key);
      } catch {
        return memoryStorage.getItem(key);
      }
    },
    setItem: (key: string, value: string) => {
      memoryStorage.setItem(key, value);
      try {
        localStorage.setItem(key, value);
      } catch {
        // localStorage failed, continue with memory only
      }
    },
    removeItem: (key: string) => {
      memoryStorage.removeItem(key);
      try {
        localStorage.removeItem(key);
      } catch {
        // localStorage failed, continue with memory only
      }
    },
  };
};

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storage: createStorageAdapter() as any,
  },
});

const ROLE_VALUES = ['farmer', 'manufacturer', 'auditor'] as const;
export type ProfileRole = typeof ROLE_VALUES[number];

const isProfileRole = (value: unknown): value is ProfileRole =>
  typeof value === 'string' && ROLE_VALUES.includes(value as ProfileRole);

// Helper to get the current access token
export const getAccessToken = async (): Promise<string | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      console.log('Token from session:', session.access_token.substring(0, 20) + '...');
      return session.access_token;
    }
    
    // Fallback to localStorage
    const storedToken = localStorage.getItem('supabase_access_token');
    if (storedToken) {
      console.log('Token from localStorage:', storedToken.substring(0, 20) + '...');
      return storedToken;
    }
    
    console.log('No access token found');
    return null;
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};

// Helper to get the current user profile with role
export const getUserProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.log('No authenticated user found');
    return null;
  }

  console.log('Fetching profile for user:', user.id, 'email:', user.email);

  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, email, name, role')
      .eq('id', user.id);

    if (error) {
      console.error('Supabase error fetching profile:', {
        message: error.message,
        code: error.code,
        details: error,
      });
      return null;
    }

    console.log('Profile data from DB - returned profiles:', profiles, 'length:', profiles?.length);

    if (!profiles || profiles.length === 0) {
      console.error('No profile found for user:', user.id, '(profiles array is empty or null)');
      return null;
    }

    const profile = profiles[0];
    console.log('First profile object:', JSON.stringify(profile, null, 2));

    if (!isProfileRole(profile?.role)) {
      console.error('Profile role missing or invalid for user:', user.id, 'profile:', profile, 'role value:', profile?.role, 'role type:', typeof profile?.role);
      return null;
    }

    console.log('Profile validation passed, returning user object');
    return {
      id: user.id,
      email: profile.email || user.email,
      name: profile.name || user.email?.split('@')[0] || 'User',
      role: profile.role,
    };
  } catch (error) {
    console.error('Exception in getUserProfile:', error, 'error type:', typeof error);
    return null;
  }
};

export const upsertUserProfile = async (profile: {
  id: string;
  email: string | null;
  name: string;
  role: ProfileRole;
}) => {
  const { error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
      },
      { onConflict: 'id' }
    );

  if (error) {
    throw new Error(error.message || 'Failed to create user profile.');
  }
};
