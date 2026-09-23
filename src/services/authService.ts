import apiClient from '@/lib/axios';
import { AuthResponse, LoginCredentials } from '@/types/auth';

export const authService = {
  /**
   * Log in user with username and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  /**
   * Get current authenticated user profile
   */
  async getCurrentUser(): Promise<AuthResponse> {
    const response = await apiClient.get<AuthResponse>('/auth/me');
    return response.data;
  },
};

export default authService;
