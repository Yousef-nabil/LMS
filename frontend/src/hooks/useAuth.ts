import { useCallback } from 'react';
import { useAppDispatch } from '../store/hooks';
import { useNavigate } from 'react-router';
import { authService } from '../api';
import { setCredentials, logoutUser, setInitialized } from '../store/slices/authSlice';

export function useAuth() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();


  const authenticate = useCallback(async (authFn: () => Promise<void>) => {
    await authFn();
    const { data: user } = await authService.getSelf();
    dispatch(setCredentials({ user }));
    if (user.role === 'instructor') {
      navigate('/instructor/dashboard');
    } else {
      navigate('/student/dashboard');
    }
  }, [dispatch, navigate]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      dispatch(logoutUser());
      window.location.href = '/';
    }
  }, [dispatch]);

  const checkAuth = useCallback(async () => {
    try {
      const { data: user } = await authService.getSelf();
      dispatch(setCredentials({ user }));
    } catch (error) {
      dispatch(setInitialized());
    }
  }, [dispatch]);

  return { authenticate, logout, checkAuth };
}
