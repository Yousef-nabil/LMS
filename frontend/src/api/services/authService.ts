import api from '../client';
import type {
  LoginRequest,
  SignupRequest,
  UpdateProfileRequest,
} from '../../types/auth';

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const normalizeUser = <T extends { profilePictureUrl?: string | null }>(
  user: T,
) => ({
  ...user,
  profilePictureUrl:
    user.profilePictureUrl && user.profilePictureUrl.startsWith('/')
      ? `${apiBaseUrl}${user.profilePictureUrl}`
      : (user.profilePictureUrl ?? null),
});

export const authService = {
  login: async (credentials: LoginRequest) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  signup: async (data: SignupRequest) => {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getSelf: async () => {
    const response = await api.get('/users/info');
    return {
      ...response.data,
      data: normalizeUser(response.data.data),
    };
  },

  updateProfile: async (data: UpdateProfileRequest) => {
    const formData = new FormData();

    if (data.name !== undefined) {
      formData.append('name', data.name);
    }
    if (data.oldPassword) {
      formData.append('oldPassword', data.oldPassword);
    }
    if (data.newPassword) {
      formData.append('newPassword', data.newPassword);
    }
    if (data.confirmNewPassword) {
      formData.append('confirmNewPassword', data.confirmNewPassword);
    }
    if (data.profilePictureFile) {
      formData.append('profilePicture', data.profilePictureFile);
    }

    const response = await api.patch('/users/update', formData);
    return normalizeUser(response.data.data);
  },
};
