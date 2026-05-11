export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginErrors {
  email?: string;
  password?: string;
}

export type Role = 'student' | 'instructor';

export interface AuthUser {
  name: string;
  email: string;
  role: Role | string;
  profilePictureUrl?: string | null;
}

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

export interface UpdateProfileRequest {
  name?: string;
  profilePictureFile?: File | null;
  oldPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
}

export interface UpdateProfileErrors {
  name?: string;
  profilePictureFile?: string;
  oldPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
}
