import {Helmet} from 'react-helmet';
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {PageLayout} from 'components/PageLayout';
import ErrorBoundary from 'components/ErrorBoundary';
import {Login} from 'pages/Login';
import {ResetPassword} from 'pages/ResetPassword';
import {MyUnits} from 'pages/Units';
import {UnitsDetail} from 'pages/UnitDetails';
import {Contracts} from 'pages/Contracts';
import {Customer} from 'pages/Customers';
import {ContractDetails} from 'pages/ContractDetails';
import {CustomerDetails} from 'pages/CustomerDetails';
import {Invoices} from 'pages/Invoices';
import {DraftInvoice} from 'pages/InvoiceDetails/DraftInvoice';
import {InvoiceDetails} from 'pages/InvoiceDetails';
import {Employees} from 'pages/Employee';
import {EmployeeDetails} from 'pages/EmployeeDetails';
import {Quotations} from 'pages/Quotations';
import {DraftQuotation} from 'pages/QuotationDetails/DraftQuotation';
import {QuotationDetails} from 'pages/QuotationDetails';
import {Notifications} from 'pages/Notifications';
import {PageNotFound} from 'pages/PageNotFound';
import {ServiceOrders} from 'pages/ServiceOrders';
import {NewEmployee} from 'pages/NewEmployee';
import {ServiceOrderDetails} from 'pages/ServiceOrderDetails';
import {axiosClient} from 'utils/axios-utils';
import {languageMap, onVisibilityChange} from 'utils/utils';
import i18n from 'i18next';
import {useEffect, useState} from 'react';
import {Mixpanel} from 'mixpanel/mixpanel';
import {mixpanelEvents} from 'mixpanel/constants';
import {NewServiceOrder} from 'pages/NewServiceOrder';
import {NewUnit} from 'pages/NewUnit';
import {NewCustomer} from 'pages/NewCustomer';
import {Articles} from 'pages/Articles';
import {ArticleOverView} from 'pages/ArticleDetails';
import {ProtectedRoutes} from './ProtectedRoutes';
import {AuthRoutes} from './AuthRoutes';
import {NewArticle} from '../pages/ArticleDetails/NewArticle';

export const Router = () => {
  const titleTail = 'Service Manager Portal';
  const {language} = i18n;
  const {t} = useTranslation();

  if (language) {
    axiosClient.defaults.headers.common.language = languageMap[language];
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
          <Route path="/" element={<Navigate to="/orders" />} />

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
                  <DraftInvoice />
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
                  backBtnLabel="Invoice Details">
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
            path="/notifications"
            element={
              <>
                <Helmet>
                  <title>{`Notifications - ${titleTail}`}</title>
                </Helmet>
                <PageLayout
                  excludeSidebar
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
