import { Navigate, Outlet } from 'react-router';
import { useAppSelector } from '../store/hooks';

interface RoleRouteProps {
  allowedRole: 'student' | 'instructor';
}

export function RoleRoute({ allowedRole }: RoleRouteProps) {
  const { user } = useAppSelector((state) => state.auth);

  if (user && user.role !== allowedRole) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return <Outlet />;
}
