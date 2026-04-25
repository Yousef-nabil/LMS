import type { AxiosInstance } from "axios";

export const setupInterceptors = (api: AxiosInstance) => {
  
  api.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
  );

  // Response Interceptor: The Refresh Logic
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Attempt to refresh the token
          await api.post('/auth/refresh');
          
          // Retry the original request
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed (token expired). Handle logout.
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};