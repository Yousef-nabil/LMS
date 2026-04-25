import type { LoginErrors, SignupErrors, Role } from "../types/auth";

export const validateLogin = (email: string, password: string): LoginErrors => {
  const errors: LoginErrors = {};

  if (!email) {
    errors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.email = "Please enter a valid email address";
  }

  if (!password) {
    errors.password = "Password is required";
  } else if (password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  return errors;
};

export const validateSignup = (
  name: string,
  email: string,
  password: string,
  confirmPassword: string,
  role: Role | ""
): SignupErrors => {
  const errors: SignupErrors = {};

  if (!name.trim()) {
    errors.name = "Full name is required";
  }

  if (!email) {
    errors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.email = "Please enter a valid email address";
  }

  if (!password) {
    errors.password = "Password is required";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  } else if (!/[a-z]/.test(password)) {
    errors.password = "Password must contain at least 1 lowercase letter";
  } else if (!/[A-Z]/.test(password)) {
    errors.password = "Password must contain at least 1 uppercase letter";
  } else if (!/[0-9]/.test(password)) {
    errors.password = "Password must contain at least 1 number";
  } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.password = "Password must contain at least 1 symbol";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
  } else if (confirmPassword !== password) {
    errors.confirmPassword = "Passwords do not match";
  }

  if (!role) {
    errors.role = "Please select a role";
  }

  return errors;
};
