import axios, { AxiosError } from 'axios';
import type { Batch, CreateBatchPayload, ApiError } from '@/types/batch';

// TEMP AUTH DISABLED FOR EVALUATION – RESTORE SUPABASE AFTER DEMO

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// Request interceptor - NO AUTHENTICATION REQUIRED
api.interceptors.request.use(
  async (config) => {
    // AUTH DISABLED: No token needed
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('501 Unauthorized - Token may be invalid or expired:', error);
      // Token expired or invalid - could redirect to login
      // Optionally: window.location.href = '/auth';
    } else if (error.response?.status === 403) {
      console.error('403 Forbidden - Check JWT token and RLS policies:', error);
    } else {
      console.error(`API Error ${error.response?.status}:`, error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

// API error handler
const handleApiError = (error: AxiosError): ApiError => {
  if (error.response?.data) {
    const data = error.response.data as Record<string, unknown>;
    return {
      message: data.detail as string || 'An error occurred',
      details: data as Record<string, string[]>,
    };
  }
  return {
    message: error.message || 'Network error occurred',
  };
};

/**
 * Submit a new batch for verification
 */
export const createBatch = async (payload: CreateBatchPayload): Promise<Batch> => {
  try {
    const formData = new FormData();
    formData.append('herb_type', payload.herb_type);
    formData.append('harvest_date', payload.harvest_date);
    formData.append('latitude', payload.latitude.toString());
    formData.append('longitude', payload.longitude.toString());
    formData.append('image', payload.image);

    const response = await api.post<Batch>('/api/batches/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    throw handleApiError(error as AxiosError);
  }
};

/**
 * Fetch a single batch by ID
 */
export const getBatchById = async (id: number): Promise<Batch> => {
  try {
    const response = await api.get<Batch>(`/api/batches/${id}/`);
    return response.data;
  } catch (error) {
    throw handleApiError(error as AxiosError);
  }
};

/**
 * Fetch all batches
 */
export const getAllBatches = async (): Promise<Batch[]> => {
  try {
    const response = await api.get<Batch[]>('/api/batches/');
    return response.data;
  } catch (error) {
    throw handleApiError(error as AxiosError);
  }
};

/**
 * Download certificate for an approved batch
 */
export const downloadCertificate = async (batchId: number): Promise<Blob> => {
  try {
    const response = await api.get<Blob>(`/api/certificate/${batchId}/`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error as AxiosError);
  }
};

/**
 * Backend User Profile Interface
 */
export interface BackendUserProfile {
  id: string;
  email: string;
  name: string;
  role: 'farmer' | 'manufacturer' | 'auditor';
  supabase_id?: string;
}

/**
 * Sync/Create user profile on backend
 * Called after Supabase authentication to ensure profile exists in Django
 */
export const syncUserProfileToBackend = async (profile: {
  email: string;
  name: string;
  role: 'farmer' | 'manufacturer' | 'auditor';
}): Promise<BackendUserProfile> => {
  try {
    console.log('Syncing user profile to backend:', profile);
    const response = await api.post<BackendUserProfile>(
      '/api/auth/profile/',
      profile
    );
    console.log('Profile synced successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to sync profile to backend:', error);
    throw handleApiError(error as AxiosError);
  }
};

/**
 * Fetch user profile from backend
 * Gets the current user's profile stored in Django
 */
export const getBackendUserProfile = async (): Promise<BackendUserProfile> => {
  try {
    console.log('Fetching user profile from backend');
    const response = await api.get<BackendUserProfile>('/api/auth/profile/');
    console.log('Profile fetched from backend:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch profile from backend:', error);
    throw handleApiError(error as AxiosError);
  }
};

export default api;
