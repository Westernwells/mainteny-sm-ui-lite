import {Helmet} from 'react-helmet';
import {Route, Routes, useLocation, useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {PageLayout} from 'components/PageLayout';
import ErrorBoundary from 'components/ErrorBoundary';
import {axiosClient} from 'utils/axios-utils';
import {onVisibilityChange} from 'utils/utils';
import {lazy, useEffect, useState} from 'react';
import {Mixpanel} from 'mixpanel/mixpanel';
import {mixpanelEvents} from 'mixpanel/constants';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {ProtectedRoutes} from './ProtectedRoutes';
import {AuthRoutes} from './AuthRoutes';

const Login = lazy(() => import('pages/Login'));
const ResetPassword = lazy(() => import('pages/ResetPassword'));
const MyUnits = lazy(() => import('pages/Units'));
const UnitsDetail = lazy(() => import('pages/UnitDetails'));
const Contracts = lazy(() => import('pages/Contracts'));
const NewContract = lazy(() => import('pages/NewContract/NewContract'));
const Customer = lazy(() => import('pages/Customers'));
const ContractDetails = lazy(() => import('pages/ContractDetails'));
const CustomerDetails = lazy(() => import('pages/CustomerDetails'));
const Invoices = lazy(() => import('pages/Invoices'));
const NewInvoice = lazy(() => import('pages/InvoiceDetails/NewInvoice'));
const InvoiceDetails = lazy(() => import('pages/InvoiceDetails'));
const EditInvoicePage = lazy(() => import('pages/EditInvoice'));
const InvoiceOverdueNotice = lazy(() => import('pages/InvoiceOverdueNotice'));
const Employees = lazy(() => import('pages/Employee'));
const EmployeeDetails = lazy(() => import('pages/EmployeeDetails'));
const Quotations = lazy(() => import('pages/Quotations'));
const DraftQuotation = lazy(
  () => import('pages/QuotationDetails/DraftQuotation'),
);
const QuotationDetails = lazy(() => import('pages/QuotationDetails'));
const EditQuotationPage = lazy(() => import('pages/EditQuotation'));
const Notifications = lazy(() => import('pages/Notifications'));
const PageNotFound = lazy(() => import('pages/PageNotFound'));
const Dashboard = lazy(() => import('pages/Dashboard'));
const ServiceOrders = lazy(() => import('pages/ServiceOrders'));
const NewEmployee = lazy(() => import('pages/NewEmployee'));
const Companies = lazy(() => import('pages/Companies'));
const CompanyDetails = lazy(() => import('pages/CompanyDetails'));
const ServiceOrderDetails = lazy(() => import('pages/ServiceOrderDetails'));
const SystemSettings = lazy(() => import('pages/SystemSettings'));
const NewCompany = lazy(() => import('pages/NewCompany'));
const SettingsPage = lazy(() => import('pages/Settings'));
const Checklist = lazy(() => import('pages/Settings/Checklist'));

const NewServiceOrder = lazy(() => import('pages/NewServiceOrder'));
const NewUnit = lazy(() => import('pages/NewUnit'));
const NewCustomer = lazy(() => import('pages/NewCustomer'));
const Articles = lazy(() => import('pages/Articles'));
const ArticleOverView = lazy(() => import('pages/ArticleDetails'));
const OrderArticle = lazy(() => import('pages/OrderArticle'));
const NewArticle = lazy(() => import('pages/ArticleDetails/NewArticle'));
const NewSupplier = lazy(() => import('pages/NewSupplier'));
const SupplierDetails = lazy(() => import('pages/SupplierDetails'));
const Analytics = lazy(() => import('pages/Analytics'));

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

  useEffect(() => {
    onVisibilityChange((visible) => {
      if (visible) {
        Mixpanel.timeEvent(mixpanelEvents.ACTIVE_SESSION);
      } else {
        Mixpanel.identifyAndTrack(mixpanelEvents.ACTIVE_SESSION);
      }
    });
  }, []);

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
                  <title>{`New service order - ${titleTail}`}</title>
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
            path="/invoices/overdue-notice/:id"
            element={
              <>
                <Helmet>
                  <title>{`Overdue Notice - ${titleTail}`}</title>
                </Helmet>
                <PageLayout
                  pageScrollable
                  backBtnLabel="Overdue notice"
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
                  <DraftQuotation />
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
                  backBtnLabel="Quotation Details"
                  showBackAction>
                  <QuotationDetails />
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
                  <title>{`Service Orders - ${titleTail}`}</title>
                </Helmet>
                <PageLayout pageTitle="Service Orders">
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
                  <title>{`Service Orders - ${titleTail}`}</title>
                </Helmet>
                <PageLayout
                  pageScrollable
                  backBtnLabel="Order Details"
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
                  <title>{`New service order - ${titleTail}`}</title>
                </Helmet>
                <PageLayout backBtnLabel={currentPageTitle} showBackAction>
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
                  backBtnLabel={t('Order Article')}
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
                  showBackAction>
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
                  showBackAction>
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
