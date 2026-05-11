import type {
  LoginErrors,
  SignupErrors,
  Role,
  UpdateProfileErrors,
} from '../types/auth';

export const validatePasswordStrength = (
  password: string,
): string | undefined => {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least 1 lowercase letter';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least 1 uppercase letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least 1 number';
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return 'Password must contain at least 1 symbol';
  }

  return undefined;
};

export const validateLogin = (email: string, password: string): LoginErrors => {
  const errors: LoginErrors = {};

  if (!email) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  return errors;
};

export const validateSignup = (
  name: string,
  email: string,
  password: string,
  confirmPassword: string,
  role: Role | '',
): SignupErrors => {
  const errors: SignupErrors = {};

  if (!name.trim()) {
    errors.name = 'Full name is required';
  }

  if (!email) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.email = 'Please enter a valid email address';
  }

  const passwordError = validatePasswordStrength(password);
  if (passwordError) {
    errors.password = passwordError;
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (confirmPassword !== password) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (!role) {
    errors.role = 'Please select a role';
  }

  return errors;
};

export const validateProfileUpdate = (
  name: string,
  oldPassword: string,
  newPassword: string,
  confirmNewPassword: string,
): UpdateProfileErrors => {
  const errors: UpdateProfileErrors = {};

  if (!name.trim()) {
    errors.name = 'Full name is required';
  }

  const wantsPasswordChange =
    Boolean(oldPassword) || Boolean(newPassword) || Boolean(confirmNewPassword);

  if (wantsPasswordChange && !oldPassword) {
    errors.oldPassword = 'Enter your current password to change it';
  }

  if (wantsPasswordChange) {
    const passwordError = validatePasswordStrength(newPassword);
    if (passwordError) {
      errors.newPassword = passwordError;
    }

    if (!confirmNewPassword) {
      errors.confirmNewPassword = 'Please confirm your new password';
    } else if (confirmNewPassword !== newPassword) {
      errors.confirmNewPassword = 'Passwords do not match';
    }
  }

  return errors;
};
