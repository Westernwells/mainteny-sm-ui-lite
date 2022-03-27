import {Helmet} from 'react-helmet';
import {Navigate, Route, Routes} from 'react-router-dom';
import {PageLayout} from 'components/PageLayout';
import {Login} from 'pages/Login';
import {Recover} from 'pages/Recover';
import {MyUnits} from 'pages/Units';
import {UnitsDetail} from 'pages/UnitDetails';
import {Contracts} from 'pages/Contracts';
import {Customer} from 'pages/Customer';
import {ContractDetails} from 'pages/ContractDetails';
import {CustomerDetails} from 'pages/CustomerDetails';
import {Invoices} from 'pages/Invoices';
import {InvoiceDetails} from 'pages/InvoiceDetails';
import {Notifications} from 'pages/Notifications';
import {PageNotFound} from 'pages/PageNotFound';
import {Employees} from 'pages/Employee';
import {ProtectedRoutes} from './ProtectedRoutes';
import {AuthRoutes} from './AuthRoutes';

export const Router = () => {
  const titleTail = 'Service Manager Portal';

  return (
    <Routes>
      <Route
        element={
          <>
            <Helmet>
              <title>{`Mainteny - ${titleTail}`}</title>
            </Helmet>
            <AuthRoutes />
          </>
        }>
        <Route path="/login" element={<Login />} />
        <Route path="/recover" element={<Recover />} />
      </Route>
      <Route element={<ProtectedRoutes />}>
        <Route path="/" element={<Navigate to="/units" />} />

        <Route
          path="/units"
          element={
            <>
              <Helmet>
                <title>{`Units - ${titleTail}`}</title>
              </Helmet>
              <PageLayout>
                <MyUnits />
              </PageLayout>
            </>
          }
        />
        <Route
          path="/units/:id"
          element={
            <>
              <Helmet>
                <title>{`Unit Details - ${titleTail}`}</title>
              </Helmet>
              <PageLayout excludeDefaultSpacing overflowY>
                <UnitsDetail />
              </PageLayout>
            </>
          }
        />

        <Route
          path="/contracts"
          element={
            <>
              <Helmet>
                <title>{`Contracts - ${titleTail}`}</title>
              </Helmet>
              <PageLayout>
                <Contracts />
              </PageLayout>
            </>
          }
        />
        <Route
          path="/contracts/:id"
          element={
            <>
              <Helmet>
                <title>{`Contract Details - ${titleTail}`}</title>
              </Helmet>
              <PageLayout overflowY>
                <ContractDetails />
              </PageLayout>
            </>
          }
        />

        <Route
          path="/invoices"
          element={
            <>
              <Helmet>
                <title>{`Invoices - ${titleTail}`}</title>
              </Helmet>
              <PageLayout>
                <Invoices />
              </PageLayout>
            </>
          }
        />
        <Route
          path="/invoices/:id"
          element={
            <>
              <Helmet>
                <title>{`Invoice Details - ${titleTail}`}</title>
              </Helmet>
              <PageLayout overflowY>
                <InvoiceDetails />
              </PageLayout>
            </>
          }
        />

        <Route
          path="/employees"
          element={
            <>
              <Helmet>
                <title>{`Employees - ${titleTail}`}</title>
              </Helmet>
              <PageLayout>
                <Employees />
              </PageLayout>
            </>
          }
        />

        <Route
          path="/customers"
          element={
            <>
              <Helmet>
                <title>{`Customers - ${titleTail}`}</title>
              </Helmet>
              <PageLayout overflowY>
                <Customer />
              </PageLayout>
            </>
          }
        />
        <Route
          path="/customers/:id"
          element={
            <>
              <Helmet>
                <title>{`Customer Details - ${titleTail}`}</title>
              </Helmet>
              <PageLayout overflowY>
                <CustomerDetails />
              </PageLayout>
            </>
          }
        />

        <Route
          path="/notifications"
          element={
            <>
              <Helmet>
                <title>{`Notifications - ${titleTail}`}</title>
              </Helmet>
              <PageLayout excludeSidebar overflowY excludeDefaultSpacing>
                <Notifications />
              </PageLayout>
            </>
          }
        />

        <Route
          path="*"
          element={
            <>
              <Helmet>
                <title>{`Page not found! - ${titleTail}`}</title>
              </Helmet>
              <PageLayout excludeSidebar overflowY excludeDefaultSpacing>
                <PageNotFound />
              </PageLayout>
            </>
          }
        />
      </Route>
    </Routes>
  );
};
