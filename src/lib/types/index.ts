// User Types
export type Role = 'warrior' | 'guardian' | 'caregiver' | 'user' | 'admin';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  emergency_contact?: string;
  role: Role;
  age?: number;
  status?: UserStatus;
  verification_status?: VerificationStatus;
  verification_note?: string;
  medical_license?: string;
  organization_name?: string;
  organization_type?: string;
  created_at: string;
  updated_at?: string;
}

// Auth Types
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  crisisAlerts: number;
  userGrowth: number;
  userDistribution: {
    warriors: number;
    guardians: number;
    caregivers: number;
    admins: number;
  };
  platformActivity: {
    totalConnections: number;
    messagesSent: number;
    reportsGenerated: number;
    avgPainLevel: number;
  };
}

// Pain Types
export interface PainLog {
  id: string;
  warrior_id: string;
  warrior_name?: string;
  pain_level: number;
  is_crisis: boolean;
  notes?: string;
  logged_at: string;
}

export interface PainSummary {
  warrior_id: string;
  log_date: string;
  max_pain_level: number;
  crisis_count: number;
  average_pain_level?: number;
}

// Connection Types
export type ConnectionStatus = 'pending' | 'accepted' | 'rejected';

export interface Connection {
  id: string;
  requester_id: string;
  requester_name?: string;
  requester_email?: string;
  requester_role: Role;
  recipient_id: string;
  recipient_name?: string;
  recipient_email?: string;
  recipient_role: Role;
  status: ConnectionStatus;
  created_at: string;
  updated_at: string;
}

// Task Types
export type RequestType = 'medication_reminder' | 'health_assessment' | 'therapy_session' | 'vital_monitoring';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'rejected';
export type GuardianApprovalState = 'pending' | 'approved' | 'rejected';

export interface TaskRequest {
  id: string;
  warrior_id: string;
  warrior_name?: string;
  request_type: RequestType;
  title: string;
  description?: string;
  priority_level?: number;
  due_date?: string;
  task_status: TaskStatus;
  guardian_approval_state: GuardianApprovalState;
  created_at: string;
  updated_at: string;
}

// Streakable Types
export interface StreakableItem {
  id: string;
  title: string;
  description?: string;
  frequency_per_day: number;
  interval_days: number;
  adoption_count?: number;
  created_at: string;
  updated_at: string;
}

// User Action Types
export interface UserAction {
  id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  action_type: string;
  action_at: string;
  action_date: string;
  metadata?: Record<string, unknown>;
}

// Verification Types (for organizations)
// Verification Types (for organizations)
export type VerificationStatus = 'pending' | 'approved' | 'rejected';
export type OrganizationType = 'ngo' | 'hospital' | 'clinic' | 'foundation' | 'other' | string;

export interface VerificationRequest {
  id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  role: Role;
  organization_name?: string;
  organization_type?: OrganizationType;
  medical_license?: string;
  verification_status: VerificationStatus;
  verification_note?: string;
  submitted_at: string;
  verified_at?: string;
  // Kept logic for description mapping if needed
  description?: string; 
}

// Broadcast Types
export type BroadcastPriority = 'low' | 'medium' | 'high' | 'urgent';
export type BroadcastAudience = 'all' | 'warriors' | 'guardians' | 'caregivers';

export interface Broadcast {
  id: string;
  title: string;
  content: string;
  priority: BroadcastPriority;
  audience: BroadcastAudience;
  recipient_count: number;
  read_count: number;
  sent_at?: string;
  scheduled_at?: string;
  created_by: string;
}

// Analytics Types
export interface AnalyticsData {
  avgPainLevel: number;
  totalEntries: number;
  medicationAdherence: number;
  activeWarriors: number;
  painTrends: Array<{
    date: string;
    avgPain: number;
    crisisCount: number;
  }>;
  genderDistribution: {
    male: number;
    female: number;
    other: number;
  };
  crisisSeverity: {
    mild: number;
    moderate: number;
    severe: number;
  };
  ageDistribution: Array<{
    range: string;
    count: number;
  }>;
  regionalDistribution?: Array<{
    region: string;
    warriors: number;
    guardians: number;
    caregivers: number;
  }>;
  medicationAdherenceData?: Array<{
    week: string;
    adherence: number;
  }>;
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}
