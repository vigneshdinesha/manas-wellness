import { ApiResponse, SupportMessage, AdminSupportMessage, CreateSupportMessageDto, HealthCheckResponse } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:7000';

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        let errorText = '';
        try {
          const errorData = await response.json();
          if (errorData.errors) {
            // ASP.NET Core validation errors
            return {
              status: response.status,
              error: 'Validation failed',
              data: errorData as T
            };
          }
          errorText = errorData.message || errorData.title || JSON.stringify(errorData);
        } catch {
          errorText = await response.text();
        }
        
        return {
          status: response.status,
          error: `HTTP ${response.status}: ${errorText || response.statusText}`
        };
      }

      // Handle 204 No Content responses
      if (response.status === 204) {
        return { status: response.status, data: undefined as T };
      }

      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      console.error('API Request Error:', error);
      return {
        status: 0,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  // Health & Testing
  async checkHealth() {
    return this.request<HealthCheckResponse>('/api/support-messages/health');
  }

  async testDatabaseConnection() {
    return this.request('/api/databasetest/connection');
  }

  // Public Support Messages
  async getSupportMessages() {
    return this.request<SupportMessage[]>('/api/support-messages');
  }

  async createSupportMessage(message: CreateSupportMessageDto) {
    return this.request<{ id: number }>('/api/support-messages', {
      method: 'POST',
      body: JSON.stringify(message),
    });
  }

  // Admin Support Messages
  async getAllSupportMessages() {
    return this.request<AdminSupportMessage[]>('/api/admin/support-messages');
  }

  async approveSupportMessage(id: number) {
    return this.request<void>(`/api/admin/support-messages/${id}/approve`, {
      method: 'PUT',
    });
  }

  async deleteSupportMessage(id: number) {
    return this.request<void>(`/api/admin/support-messages/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
