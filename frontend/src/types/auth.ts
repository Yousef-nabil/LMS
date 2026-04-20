export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginErrors {
  email?: string;
  password?: string;
}
