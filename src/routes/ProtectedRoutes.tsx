import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {Navigate, Outlet, useLocation} from 'react-router-dom';

interface Location {
  pathname: string;
  search: string;
  hash: string;
  state: any;
  key: string;
}

export const ProtectedRoutes = () => {
  const {user} = useUserSession();
  const location: Location = useLocation();
  if (user?.token) {
    return <Outlet />;
  }
  return (
    <Navigate to="/login" state={{...location.state, from: location}} replace />
  );
};
