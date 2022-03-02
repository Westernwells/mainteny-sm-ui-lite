import {TempHomePage} from 'pages/TempHomePage';

import {Navigate, Route, Routes} from 'react-router-dom';
import {PageLayout} from 'components/PageLayout';
import {Login} from 'pages/Login';
import {PasswordReset} from 'pages/PasswordReset';
import {MyUnits} from 'pages/Units';
import {UnitsDetail} from 'pages/UnitDetails';
import {Contracts} from 'pages/Contracts';
import {ContractDetails} from 'pages/ContractDetails';
import {Invoices} from 'pages/Invoices';
import {InvoiceDetails} from 'pages/InvoiceDetails';
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
            <UnitsDetail />
          </PageLayout>
        }
      />

      <Route
        path="/contracts"
        element={
          <PageLayout>
            <Contracts />
          </PageLayout>
        }
      />
      <Route
        path="/contracts/:id"
        element={
          <PageLayout overflowY>
            <ContractDetails />
          </PageLayout>
        }
      />

      <Route
        path="/invoices"
        element={
          <PageLayout>
            <Invoices />
          </PageLayout>
        }
      />
      <Route
        path="/invoices/:id"
        element={
          <PageLayout overflowY>
            <InvoiceDetails />
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
      <Route
        path="/customers/:id"
        element={
          <PageLayout>
            <div>
              <h2>Customer Details</h2>
            </div>
          </PageLayout>
        }
      />
    </Route>
  </Routes>
);
