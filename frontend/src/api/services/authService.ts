import api from "../client";
import type { LoginRequest, SignupRequest } from "../../types/auth";

export const authService = {
  login: async (credentials: LoginRequest) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  signup: async (data: SignupRequest) => {
    const response = await api.post("/auth/signup", data);
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  getSelf: async () => {
    const response = await api.get("/users/info");
    return response.data;
  },
};
