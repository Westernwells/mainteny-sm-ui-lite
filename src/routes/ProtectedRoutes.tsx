import {useState} from 'react';
import {AppDrawer} from 'components/AppDrawer';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {Navigate, Outlet, useLocation} from 'react-router-dom';

export const ProtectedRoutes = () => {
  const {user} = useUserSession();
  const location = useLocation();

  const [open, setOpen] = useState<boolean>(false);

  if (user === undefined) return null;

  if (user && user.token) {
    return (
      <>
        <AppDrawer open={open} setOpen={setOpen} />
        <Outlet context={{setOpen}} />
      </>
    );
  }
  return <Navigate to="/login" state={{from: location}} replace />;
};
