import api from "./axios";
import type { LoginRequest } from "../types/auth";

export const authService = {
  login: async (credentials: LoginRequest) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },
  
 
  getSelf: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  }
};
