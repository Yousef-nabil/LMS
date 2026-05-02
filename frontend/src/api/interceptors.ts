import type { AxiosInstance } from "axios";

let refreshTokenPromise: Promise<any> | null = null;

export const setupInterceptors = (api: AxiosInstance) => {
  api.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
  );

  // Response Interceptor: The Refresh Logic
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      console.log(error)
      const originalRequest = error.config;
  if (!originalRequest) {
    return Promise.reject(error);
  }

      if (originalRequest.url?.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // If a refresh is already in progress, wait for it to finish instead of starting a new one
          if (!refreshTokenPromise) {
            refreshTokenPromise = api.post('/auth/refresh').finally(() => {
              refreshTokenPromise = null;
            });
          }
          await refreshTokenPromise;
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