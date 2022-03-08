import {Navigate, Route, Routes} from 'react-router-dom';
import {PageLayout} from 'components/PageLayout';
import {Login} from 'pages/Login';
import {
  PasswordAuthenticate,
  PasswordRequest,
  PasswordReset,
} from 'pages/PasswordReset';
import {MyUnits} from 'pages/Units';
import {UnitsDetail} from 'pages/UnitDetails';
import {Contracts} from 'pages/Contracts';
import {Customer} from 'pages/Customer';
import {ContractDetails} from 'pages/ContractDetails';
import {CustomerDetails} from 'pages/CustomerDetails/indext';
import {Invoices} from 'pages/Invoices';
import {InvoiceDetails} from 'pages/InvoiceDetails';
import {ProtectedRoutes} from './ProtectedRoutes';
import {AuthRoutes} from './AuthRoutes';

export const Router = () => (
  <Routes>
    <Route element={<AuthRoutes />}>
      <Route path="/login" element={<Login />} />
      <Route
        path="/reset-password"
        element={<Navigate to="/reset-password/request" />}
      />
      <Route path="/reset-password/request" element={<PasswordRequest />} />
      <Route
        path="/reset-password/authenticate"
        element={<PasswordAuthenticate />}
      />
      <Route path="/reset-password/reset" element={<PasswordReset />} />
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
            <Customer />
          </PageLayout>
        }
      />
      <Route
        path="/customers/:id"
        element={
          <PageLayout overflowY>
            <CustomerDetails />
          </PageLayout>
        }
      />
    </Route>
  </Routes>
);
