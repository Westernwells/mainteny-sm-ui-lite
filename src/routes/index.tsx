import {Helmet} from 'react-helmet';
import {Route, Routes, useLocation, useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {PageLayout} from 'components/PageLayout';
import ErrorBoundary from 'components/ErrorBoundary';
import {axiosClient} from 'utils/axios-utils';
import {useState} from 'react';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import Login from 'pages/Login';
import ResetPassword from 'pages/ResetPassword';
import MyUnits from 'pages/Units';
import UnitsDetail from 'pages/UnitDetails';
import Contracts from 'pages/Contracts';
import NewContract from 'pages/NewContract/NewContract';
import Customer from 'pages/Customers';
import ContractDetails from 'pages/ContractDetails';
import CustomerDetails from 'pages/CustomerDetails';
import Invoices from 'pages/Invoices';
import NewInvoice from 'pages/InvoiceDetails/NewInvoice';
import InvoiceDetails from 'pages/InvoiceDetails';
import EditInvoicePage from 'pages/EditInvoice';
import InvoiceOverdueNotice from 'pages/InvoiceOverdueNotice';
import Employees from 'pages/Employee';
import EmployeeDetails from 'pages/EmployeeDetails';
import Quotations from 'pages/Quotations';
import NewQuotation from 'pages/QuotationDetails/NewQuotation';
import QuotationDetails from 'pages/QuotationDetails';
import EditQuotationPage from 'pages/EditQuotation';
import Notifications from 'pages/Notifications';
import PageNotFound from 'pages/PageNotFound';
import Dashboard from 'pages/Dashboard';
import ServiceOrders from 'pages/ServiceOrders';
import NewEmployee from 'pages/NewEmployee';
import Companies from 'pages/Companies';
import CompanyDetails from 'pages/CompanyDetails';
import ServiceOrderDetails from 'pages/ServiceOrderDetails';
import SystemSettings from 'pages/SystemSettings';
import NewCompany from 'pages/NewCompany';
import SettingsPage from 'pages/Settings';
import Checklist from 'pages/Settings/Checklist';
import NewServiceOrder from 'pages/NewServiceOrder';
import NewUnit from 'pages/NewUnit';
import NewCustomer from 'pages/NewCustomer';
import Articles from 'pages/Articles';
import ArticleOverView from 'pages/ArticleDetails';
import OrderArticle from 'pages/OrderArticle';
import NewArticle from 'pages/ArticleDetails/NewArticle';
import NewSupplier from 'pages/NewSupplier';
import SupplierDetails from 'pages/SupplierDetails';
import Analytics from 'pages/Analytics';
import Contacts from 'pages/Contacts';
import {ProtectedRoutes} from './ProtectedRoutes';
import {AuthRoutes} from './AuthRoutes';

export const Router = () => {
  const titleTail = 'Service Manager Portal';
  const {user} = useUserSession();
  const {t} = useTranslation();

  if (user) {
    axiosClient.defaults.headers.common.language =
      user?.userAccount.serviceCompany.language;
  }

  const [currentPageTitle, setCurrentPageTitle] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <ErrorBoundary navigate={navigate} location={location}>
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
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>
        <Route element={<ProtectedRoutes />}>
          <Route
            path="/"
            element={
              <>
                <Helmet>
                  <title>{`Dashboard - ${titleTail}`}</title>
                </Helmet>
                <PageLayout pageTitle="Dashboard" pageScrollable>
                  <Dashboard />
                </PageLayout>
              </>
            }
          />

          <Route
            path="/units"
            element={
              <>
                <Helmet>
                  <title>{`Units - ${titleTail}`}</title>
                </Helmet>
                <PageLayout pageTitle="Units">
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
                <PageLayout
                  backBtnLabel={currentPageTitle}
                  pageScrollable
                  showBackAction>
                  <UnitsDetail
                    getCurrentPageTitle={(val) => setCurrentPageTitle(val)}
                  />
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
                <PageLayout pageTitle="Contracts">
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
                <PageLayout
                  pageScrollable
                  backBtnLabel="Contract Details"
                  showBackAction>
                  <ContractDetails />
                </PageLayout>
              </>
            }
          />
          <Route
            path="/contracts/new"
            element={
              <>
                <Helmet>
                  <title>{`New Contract - ${titleTail}`}</title>
                </Helmet>
                <PageLayout backBtnLabel="New Contract" showBackAction>
                  <NewContract />
                </PageLayout>
              </>
            }
          />
          <Route
            path="/units/new"
            element={
              <>
                <Helmet>
                  <title>{`New Unit - ${titleTail}`}</title>
                </Helmet>
                <PageLayout backBtnLabel="New Unit" showBackAction>
                  <NewUnit />
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
                <PageLayout pageTitle="Contracts">
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
                <PageLayout
                  pageScrollable
                  backBtnLabel="Contract details"
                  showBackAction>
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
                <PageLayout pageTitle="Invoices">
                  <Invoices />
                </PageLayout>
              </>
            }
          />

          <Route
            path="/invoices/new"
            element={
              <>
                <Helmet>
                  <title>{`New Invoice - ${titleTail}`}</title>
                </Helmet>
                <PageLayout
                  pageScrollable
                  backBtnLabel="New Invoice"
                  showBackAction>
                  <NewInvoice />
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
                <PageLayout
                  showBackAction
                  pageScrollable
                  backBtnLabel={currentPageTitle}>
                  <InvoiceDetails
                    getCurrentPageTitle={(val) => setCurrentPageTitle(val)}
                  />
                </PageLayout>
              </>
            }
          />

          <Route
            path="/invoices/details/:id/edit"
            element={
              <>
                <Helmet>
                  <title>{`Edit Invoice - ${titleTail}`}</title>
                </Helmet>
                <PageLayout
                  showBackAction
                  pageScrollable
                  backBtnLabel="Edit Invoice">
                  <EditInvoicePage />
                </PageLayout>
              </>
            }
          />

          <Route
            path="/invoices/:id/overdue-notice"
            element={
              <>
                <Helmet>
                  <title>{`Overdue Notice - ${titleTail}`}</title>
                </Helmet>
                <PageLayout
                  pageScrollable
                  backBtnLabel="Overdue Notice"
                  showBackAction>
                  <InvoiceOverdueNotice />
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
                <PageLayout pageTitle="Customers">
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
                <PageLayout
                  showBackAction
                  pageScrollable
                  backBtnLabel={currentPageTitle}>
                  <CustomerDetails
                    getCurrentPageTitle={(val) => setCurrentPageTitle(val)}
                  />
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
                <PageLayout pageTitle="Employees">
                  <Employees />
                </PageLayout>
              </>
            }
          />
          <Route
            path="/contacts"
            element={
              <>
                <Helmet>
                  <title>{`Contacts - ${titleTail}`}</title>
                </Helmet>
                <PageLayout pageTitle="Contacts">
                  <Contacts />
                </PageLayout>
              </>
            }
          />
          <Route
            path="/customers/new"
            element={
              <>
                <Helmet>
                  <title>New Customer</title>
                </Helmet>
                <PageLayout showBackAction backBtnLabel={currentPageTitle}>
                  <NewCustomer
                    getCurrentPageTitle={(val) => setCurrentPageTitle(val)}
                  />
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
                <PageLayout
                  pageScrollable
                  showBackAction
                  backBtnLabel={currentPageTitle}>
                  <EmployeeDetails
                    getCurrentPageTitle={(val) => setCurrentPageTitle(val)}
                  />
                </PageLayout>
              </>
            }
          />
          <Route
            path="/employees/new"
            element={
              <>
                <Helmet>
                  <title>{`New Employee - ${titleTail}`}</title>
                </Helmet>
                <PageLayout showBackAction backBtnLabel={currentPageTitle}>
                  <NewEmployee
                    getCurrentPageTitle={(val) => setCurrentPageTitle(val)}
                  />
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
                <PageLayout pageTitle="Quotations">
                  <Quotations />
                </PageLayout>
              </>
            }
          />

          <Route
            path="/quotations/new"
            element={
              <>
                <Helmet>
                  <title>{`New Quotation - ${titleTail}`}</title>
                </Helmet>
                <PageLayout
                  pageScrollable
                  backBtnLabel="New Quotation"
                  showBackAction>
                  <NewQuotation />
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
                <PageLayout
                  pageScrollable
                  backBtnLabel={currentPageTitle}
                  showBackAction>
                  <QuotationDetails
                    getCurrentPageTitle={(val) => setCurrentPageTitle(val)}
                  />
                </PageLayout>
              </>
            }
          />

          <Route
            path="/quotations/details/:id/edit"
            element={
              <>
                <Helmet>
                  <title>{`Edit Quotation - ${titleTail}`}</title>
                </Helmet>
                <PageLayout
                  pageScrollable
                  backBtnLabel="Edit Quotation"
                  showBackAction>
                  <EditQuotationPage />
                </PageLayout>
              </>
            }
          />

          <Route
            path="/orders"
            element={
              <>
                <Helmet>
                  <title>{`Service Jobs - ${titleTail}`}</title>
                </Helmet>
                <PageLayout pageTitle="Service Jobs">
                  <ServiceOrders />
                </PageLayout>
              </>
            }
          />

          <Route
            path="/orders/details/:id"
            element={
              <>
                <Helmet>
                  <title>{`Service Jobs - ${titleTail}`}</title>
                </Helmet>
                <PageLayout
                  pageScrollable
                  backBtnLabel="Job Details"
                  showBackAction>
                  <ServiceOrderDetails />
                </PageLayout>
              </>
            }
          />

          <Route
            path="/orders/new"
            element={
              <>
                <Helmet>
                  <title>{`New service job - ${titleTail}`}</title>
                </Helmet>
                <PageLayout
                  backBtnLabel={currentPageTitle}
                  showBackAction
                  pageScrollable>
                  <NewServiceOrder
                    getCurrentPageTitle={(val) => setCurrentPageTitle(val)}
                  />
                </PageLayout>
              </>
            }
          />

          <Route
            path="/articles"
            element={
              <>
                <Helmet>
                  <title>{`Articles - ${titleTail}`}</title>
                </Helmet>
                <PageLayout pageTitle="Articles & Packages">
                  <Articles />
                </PageLayout>
              </>
            }
          />

          <Route
            path="/articles/details/:id"
            element={
              <>
                <Helmet>
                  <title>{`Articles Details - ${titleTail}`}</title>
                </Helmet>
                <PageLayout
                  pageScrollable
                  backBtnLabel={t('Article Details')}
                  showBackAction>
                  <ArticleOverView />
                </PageLayout>
              </>
            }
          />

          <Route
            path="/articles/new"
            element={
              <>
                <Helmet>
                  <title>{`New Article - ${titleTail}`}</title>
                </Helmet>
                <PageLayout backBtnLabel={t('New Article')} showBackAction>
                  <NewArticle />
                </PageLayout>
              </>
            }
          />

          <Route
            path="/articles/newPackage"
            element={
              <>
                <Helmet>
                  <title>{`New Package - ${titleTail}`}</title>
                </Helmet>
                <PageLayout backBtnLabel="New Package" showBackAction>
                  <NewArticle />
                </PageLayout>
              </>
            }
          />

          <Route
            path="/articles/newSupplier"
            element={
              <>
                <Helmet>
                  <title>{`New Supplier - ${titleTail}`}</title>
                </Helmet>
                <PageLayout backBtnLabel="New Supplier" showBackAction>
                  <NewSupplier />
                </PageLayout>
              </>
            }
          />

          <Route
            path="/articles/supplier/:id"
            element={
              <>
                <Helmet>
                  <title>{`Supplier Details - ${titleTail}`}</title>
                </Helmet>
                <PageLayout
                  pageScrollable
                  backBtnLabel={t('Supplier Details')}
                  showBackAction>
                  <SupplierDetails />
                </PageLayout>
              </>
            }
          />

          <Route
            path="/articles/order"
            element={
              <>
                <Helmet>
                  <title>{`Order Article - ${titleTail}`}</title>
                </Helmet>
                <PageLayout
                  backBtnLabel="Order Article"
                  showBackAction
                  pageScrollable>
                  <OrderArticle />
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
                <PageLayout
                  pageScrollable
                  excludeDefaultSpacing
                  backBtnLabel="Notifications"
                  showBackAction>
                  <Notifications />
                </PageLayout>
              </>
            }
          />

          <Route
            path="/analytics"
            element={
              <>
                <Helmet>
                  <title>{`Analytics - ${titleTail}`}</title>
                </Helmet>
                <PageLayout pageTitle="Analytics">
                  <Analytics />
                </PageLayout>
              </>
            }
          />

          <Route
            path="/settings"
            element={
              <>
                <Helmet>
                  <title>{`Settings - ${titleTail}`}</title>
                </Helmet>
                <PageLayout pageScrollable pageTitle="Settings">
                  <SettingsPage />
                </PageLayout>
              </>
            }
          />

          <Route
            path="/settings/checklist/new"
            element={
              <>
                <Helmet>
                  <title>{`New Checklist - ${titleTail}`}</title>
                </Helmet>
                <PageLayout
                  backBtnLabel="New Checklist"
                  pageScrollable
                  showBackAction
                  containerStyles={{
                    overflow: 'visible',
                  }}>
                  <Checklist />
                </PageLayout>
              </>
            }
          />

          <Route
            path="/settings/checklists/:id"
            element={
              <>
                <Helmet>
                  <title>{`Checklist - ${titleTail}`}</title>
                </Helmet>
                <PageLayout
                  backBtnLabel="Checklist"
                  pageScrollable
                  showBackAction
                  containerStyles={{
                    overflow: 'visible',
                  }}>
                  <Checklist />
                </PageLayout>
              </>
            }
          />

          <Route
            path="admin/companies"
            element={
              <>
                <Helmet>
                  <title>{`Companies - ${titleTail}`}</title>
                </Helmet>
                <PageLayout pageTitle="Companies">
                  <Companies />
                </PageLayout>
              </>
            }
          />
          <Route
            path="/admin/companies/details/:id"
            element={
              <>
                <Helmet>
                  <title>{`Companies Details - ${titleTail}`}</title>
                </Helmet>
                <PageLayout
                  backBtnLabel={currentPageTitle}
                  pageScrollable
                  showBackAction>
                  <CompanyDetails
                    getCurrentPageTitle={(val) => setCurrentPageTitle(val)}
                  />
                </PageLayout>
              </>
            }
          />
          <Route
            path="/admin/companies/new"
            element={
              <>
                <Helmet>
                  <title>New Service Company</title>
                </Helmet>
                <PageLayout showBackAction backBtnLabel={currentPageTitle}>
                  <NewCompany
                    getCurrentPageTitle={(val) => setCurrentPageTitle(val)}
                  />
                </PageLayout>
              </>
            }
          />
          <Route
            path="/admin/system-settings"
            element={
              <>
                <Helmet>
                  <title>{`System Settings - ${titleTail}`}</title>
                </Helmet>
                <PageLayout pageTitle="System Settings">
                  <SystemSettings />
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
                <PageLayout pageTitle="Oops!">
                  <PageNotFound />
                </PageLayout>
              </>
            }
          />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
};
