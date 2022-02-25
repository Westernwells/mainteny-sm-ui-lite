import {TempHomePage} from 'pages/TempHomePage';

import {Navigate, Route, Routes} from 'react-router-dom';
import {PageLayout} from 'components/PageLayout';
import {Login} from 'pages/Login';
import {PasswordReset} from 'pages/PasswordReset';
import {MyUnits} from 'pages/Units';
import {ProtectedRoutes} from './ProtectedRoutes';
import {AuthRoutes} from './AuthRoutes';

export const Router = () => (
  <Routes>
    <Route element={<AuthRoutes />}>
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<PasswordReset />} />
    </Route>
    <Route element={<ProtectedRoutes />}>
      <Route path="/" element={<Navigate to="/units" />} />
      <Route
        path="/units"
        element={
          <PageLayout>
            <MyUnits />
          </PageLayout>
        }
      />
      <Route
        path="/units/:id"
        element={
          <PageLayout excludeDefaultSpacing overflowY>
            <TempHomePage />
          </PageLayout>
        }
      />
      <Route
        path="/contracts"
        element={
          <PageLayout>
            <div>
              <h2>Contracts</h2>
            </div>
          </PageLayout>
        }
      />
      <Route
        path="/invoices"
        element={
          <PageLayout>
            <div>
              <h2>Invoices</h2>
            </div>
          </PageLayout>
        }
      />
      <Route
        path="/customers"
        element={
          <PageLayout>
            <div>
              <h2>Customers</h2>
            </div>
          </PageLayout>
        }
      />
    </Route>
  </Routes>
);
