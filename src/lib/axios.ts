import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = 'https://dummyjson.com';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach authentication token if available
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Centralized error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<{ message?: string }>) => {
    // Pass through abort/cancel errors without modification so callers can detect them
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    if (error.response) {
      const status = error.response.status;

      // Handle Unauthorized (401)
      if (status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        // Dispatch custom event to notify AuthContext to update state smoothly
        window.dispatchEvent(new Event('auth:unauthorized'));
      }

      // Format custom error message for UI consumption
      const errorMessage =
        error.response.data?.message ||
        `Request failed with status code ${status}`;
      return Promise.reject(new Error(errorMessage));
    } else if (error.name === 'AbortError' || error.name === 'CanceledError') {
      // Pass through native AbortController / axios cancel errors
      return Promise.reject(error);
    } else if (error.request) {
      return Promise.reject(
        new Error('Network error. Please check your internet connection.')
      );
    } else {
      return Promise.reject(error);
    }
  }
);

export default apiClient;
