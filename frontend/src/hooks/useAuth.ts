import { useAppDispatch } from '../store/hooks';
import { useNavigate } from 'react-router';
import { authService } from '../api';
import { setCredentials, logoutUser } from '../store/slices/authSlice';

export function useAuth() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();


  const authenticate = async (authFn: () => Promise<void>) => {
    await authFn();
    const { data: user } = await authService.getSelf();
    dispatch(setCredentials({ user }));
    navigate('/dashboard');
  };

  const logout = async () => {
    await authService.logout();
    dispatch(logoutUser());
    navigate('/login');
  };

  return { authenticate, logout };
}
