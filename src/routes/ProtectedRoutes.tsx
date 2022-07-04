import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {Navigate, Outlet, useLocation} from 'react-router-dom';

export const ProtectedRoutes = () => {
  const {user} = useUserSession();
  const location = useLocation();

  if (user === undefined) return null;

  if (user && user.token) {
    return <Outlet />;
  }
  return <Navigate to="/login" state={{from: location}} replace />;
};
