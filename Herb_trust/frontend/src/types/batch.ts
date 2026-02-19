export interface Batch {
  id: number;
  herb_type: string;
  harvest_date: string;
  latitude: number;
  longitude: number;
  image: string;
  authenticity_score: number | null;
  geo_valid: boolean | null;
  potency_score: number | null;
  compliance_status: string | null;
  blockchain_hash: string | null;
  created_at: string;
  ai_verified_at?: string | null;
  auditor_approved_at?: string | null;
  certificate_generated_at?: string | null;
  quantity_kg?: number;
  region?: string;
}

export interface CreateBatchPayload {
  herb_type: string;
  harvest_date: string;
  latitude: number;
  longitude: number;
  image: File;
}

export interface ApiError {
  message: string;
  details?: Record<string, string[]>;
}
