// Support Message Types
export interface SupportMessage {
  id: number;
  name: string;
  message: string;
  isDonating: boolean;
  createdDate: string;
}

export interface AdminSupportMessage extends SupportMessage {
  email?: string;
  isApproved: boolean;
}

export interface CreateSupportMessageDto {
  name: string;
  email?: string;
  message: string;
  isDonating: boolean;
}

// Validation Rules
export const ValidationRules = {
  name: { required: true, minLength: 1, maxLength: 100 },
  email: { required: false, maxLength: 255, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  message: { required: true, minLength: 10, maxLength: 1000 },
  isDonating: { required: false, default: false }
};

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export interface HealthCheckResponse {
  status: string;
  database: string;
  connectionString: string;
  tableExists: boolean;
  statistics: {
    totalMessages: number;
    approvedMessages: number;
    pendingMessages: number;
  };
  timestamp: string;
}
