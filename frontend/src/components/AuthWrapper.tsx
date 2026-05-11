import { useEffect } from 'react';
import { Outlet } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { useAppSelector } from '../store/hooks';
import Loading from './Loading';

export function AuthWrapper() {
  const { checkAuth } = useAuth();
  const isInitialized = useAppSelector((state) => state.auth.isInitialized);

  useEffect(() => {
    if (!isInitialized) {
      checkAuth();
    }
  }, [checkAuth, isInitialized]);

  if (!isInitialized) {
    return <Loading size="medium" />;
  }

  return <Outlet />;
}
