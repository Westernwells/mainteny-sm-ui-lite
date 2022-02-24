import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {
  Navigate,
  Outlet,
  Route,
  useLocation,
  useNavigate,
} from 'react-router-dom';

export const ProtectedRoutes = () => {
  const {user} = useUserSession();
  const location = useLocation();
  if (user?.token) {
    return <Outlet />;
  }
  return <Navigate to="/login" state={{from: location}} replace />;
};
