import apiClient from "./client";
import { setupInterceptors } from "./interceptors";

// Initialize interceptors
setupInterceptors(apiClient);

// Re-export the configured client
export default apiClient;

// Re-export all services
export { authService } from "./services/authService";
