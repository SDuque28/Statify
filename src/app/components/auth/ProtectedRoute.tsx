import { Navigate, Outlet, useLocation } from 'react-router';
import { authStorage } from '../../../services/auth-storage';

export function ProtectedRoute() {
  const location = useLocation();

  if (!authStorage.isAuthenticated()) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
