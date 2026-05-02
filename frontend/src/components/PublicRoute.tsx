import { Navigate, Outlet } from 'react-router';
import { useAppSelector } from '../store/hooks';

export function PublicRoute() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  if (isAuthenticated && user) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return <Outlet />;
}
