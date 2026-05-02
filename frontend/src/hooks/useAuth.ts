import { useAppDispatch } from '../store/hooks';
import { useNavigate } from 'react-router';
import { authService } from '../api';
import { setCredentials, logoutUser, setInitialized } from '../store/slices/authSlice';

export function useAuth() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();


  const authenticate = async (authFn: () => Promise<void>) => {
    await authFn();
    const { data: user } = await authService.getSelf();
    dispatch(setCredentials({ user }));
    if (user.role === 'instructor') {
      navigate('/instructor/dashboard');
    } else {
      navigate('/student/dashboard');
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      dispatch(logoutUser());
      window.location.href = '/';
    }
  };

  const checkAuth = async () => {
    try {
      const { data: user } = await authService.getSelf();
      dispatch(setCredentials({ user }));
    } catch (error) {
      dispatch(setInitialized());
    }
  };

  return { authenticate, logout, checkAuth };
}
