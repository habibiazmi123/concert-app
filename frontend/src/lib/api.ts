import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Token
apiClient.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Unwrap envelope + handle token expiration
apiClient.interceptors.response.use(
  (response) => {
    // Backend wraps all responses in { success, data, message, timestamp }
    // Unwrap the envelope so consumers get the actual data directly
    if (response.data && response.data.success !== undefined && response.data.data !== undefined) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If unauthorized and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
        
        if (!refreshToken) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }
        
        // Use raw axios to avoid interceptors on the refresh call
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });
        
        // Backend envelope: response.data = { success, data: { accessToken, refreshToken }, ... }
        const tokens = response.data?.data || response.data;
        const { accessToken } = tokens;
        
        if (typeof window !== 'undefined') {
             localStorage.setItem('access_token', accessToken);
        }
        
        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh token failed, force logout
        if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
