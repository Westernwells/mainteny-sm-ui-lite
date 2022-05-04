import {Helmet} from 'react-helmet';
import {Navigate, Route, Routes} from 'react-router-dom';
import {PageLayout} from 'components/PageLayout';
import {Login} from 'pages/Login';
import {Recover} from 'pages/Recover';
import {MyUnits} from 'pages/Units';
import {UnitsDetail} from 'pages/UnitDetails';
import {Contracts} from 'pages/Contracts';
import {Customer} from 'pages/Customers';
import {ContractDetails} from 'pages/ContractDetails';
import {CustomerDetails} from 'pages/CustomerDetails';
import {Invoices} from 'pages/Invoices';
import {InvoiceDetails} from 'pages/InvoiceDetails';
import {Employees} from 'pages/Employee';
import {EmployeeDetails} from 'pages/EmployeeDetails';
import {Quotations} from 'pages/Quotations';
import {QuotationDetails} from 'pages/QuotationDetails';
import {Notifications} from 'pages/Notifications';
import {PageNotFound} from 'pages/PageNotFound';
import {ServiceOrders} from 'pages/ServiceOrders';
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
        <Route
          path="/"
          element={<Navigate to="/units?pageIndex=1&pageSize=25" />}
        />

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
          path="/units/details/:id"
          element={
            <>
              <Helmet>
                <title>{`Unit Details - ${titleTail}`}</title>
              </Helmet>
              <PageLayout pageScrollable>
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
          path="/contracts/details/:id"
          element={
            <>
              <Helmet>
                <title>{`Contract Details - ${titleTail}`}</title>
              </Helmet>
              <PageLayout>
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
          path="/invoices/details/:id"
          element={
            <>
              <Helmet>
                <title>{`Invoice Details - ${titleTail}`}</title>
              </Helmet>
              <PageLayout pageScrollable>
                <InvoiceDetails />
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
              <PageLayout>
                <Customer />
              </PageLayout>
            </>
          }
        />
        <Route
          path="/customers/details/:id"
          element={
            <>
              <Helmet>
                <title>{`Customer Details - ${titleTail}`}</title>
              </Helmet>
              <PageLayout>
                <CustomerDetails />
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
          path="/employees/details/:id"
          element={
            <>
              <Helmet>
                <title>{`Employee Details - ${titleTail}`}</title>
              </Helmet>
              <PageLayout pageScrollable>
                <EmployeeDetails />
              </PageLayout>
            </>
          }
        />

        <Route
          path="/quotations"
          element={
            <>
              <Helmet>
                <title>{`Quotations - ${titleTail}`}</title>
              </Helmet>
              <PageLayout>
                <Quotations />
              </PageLayout>
            </>
          }
        />

        <Route
          path="/quotations/details/:id"
          element={
            <>
              <Helmet>
                <title>{`Quotation Details - ${titleTail}`}</title>
              </Helmet>
              <PageLayout pageScrollable>
                <QuotationDetails />
              </PageLayout>
            </>
          }
        />

        <Route
          path="/orders"
          element={
            <>
              <Helmet>
                <title>{`Service Orders - ${titleTail}`}</title>
              </Helmet>
              <PageLayout>
                <ServiceOrders />
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
              <PageLayout excludeSidebar pageScrollable excludeDefaultSpacing>
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
              <PageLayout excludeSidebar pageScrollable excludeDefaultSpacing>
                <PageNotFound />
              </PageLayout>
            </>
          }
        />
      </Route>
    </Routes>
  );
};
