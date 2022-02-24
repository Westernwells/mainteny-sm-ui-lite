import {TempHomePage} from 'pages/TempHomePage';

import {Login} from 'pages/Login';
import {Navigate, Route, Routes} from 'react-router-dom';
import {ProtectedRoutes} from './ProtectedRoutes';
import {AuthRoutes} from './AuthRoutes';

export const Router = () => (
  <Routes>
    <Route element={<AuthRoutes />}>
      <Route path="/login" element={<Login />} />
      {/* <Route path="/reset-password" element={<PasswordReset />} /> */}
    </Route>
    <Route element={<ProtectedRoutes />}>
      <Route path="/" element={<Navigate to="/units" />} />
      <Route path="/units" element={<TempHomePage />} />
    </Route>
  </Routes>
);
