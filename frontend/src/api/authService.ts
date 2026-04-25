import api from "./axios";
import type { LoginRequest, SignupRequest } from "../types/auth";

export const authService = {
  login: async (credentials: LoginRequest) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  signup: async (data: SignupRequest) => {
    const response = await api.post("/auth/register", data);
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
