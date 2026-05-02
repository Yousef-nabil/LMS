export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginErrors {
  email?: string;
  password?: string;
}

export type Role = "student" | "instructor";

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface SignupErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
}
