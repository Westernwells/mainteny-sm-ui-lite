import {Navigate, Outlet, useLocation, useNavigate} from 'react-router-dom';
import {useUserSession} from 'hooks/reactQuery/useUserSession';

interface Location {
  pathname: string;
  search: string;
  hash: string;
  state: any;
  key: string;
}

export const AuthRoutes = () => {
  const {user} = useUserSession();
  const location: Location = useLocation();
  const authRouteActive =
    !location.state ||
    location.state.from.pathname === '/login' ||
    location.state.from.pathname === '/reset-password';

  if (user?.token) {
    return (
      <Navigate
        to={authRouteActive ? '/units' : location.state.from.pathname}
        state={{from: location}}
        replace
      />
    );
  }
  return <Outlet />;
};
