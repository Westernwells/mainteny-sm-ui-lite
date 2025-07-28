import {Suspense} from 'react';
import {Navigate, Outlet, useLocation} from 'react-router-dom';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {Progress} from 'components/Progress';

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
        to={
          authRouteActive
            ? '/'
            : `${location.state.from.pathname}${
                location.state.from.search ? location.state.from.search : ''
              }`
        }
        state={{from: location}}
        replace
      />
    );
  }
  return (
    <Suspense fallback={<Progress />}>
      <Outlet />
    </Suspense>
  );
};
