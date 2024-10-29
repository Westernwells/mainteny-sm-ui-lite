import React, {useMemo, useState} from 'react';
import {Box, Button} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {useTheme} from '@mui/material/styles';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import JobNotes from 'pages/ServiceOrderDetails/JobNotes';
import {ServiceOrderStatus, ServiceOrderView} from 'models/service-order';
import {useServiceOrderActions} from 'hooks/useServiceOrderActions';
import {ScheduleDialog} from 'pages/ServiceOrderDetails/Tabs/Overview/ScheduleDialog';
import {useQuotationDetails} from 'hooks/reactQuery/useQuotation';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {useCompanyById} from 'hooks/reactQuery/useCompanies';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {useQueryClientStorageData} from 'hooks/useClientStorage';
import {useCreateAndSetPdfBlobUrl} from 'hooks/useCreateAndSetPdfBlobUrl';
import {CustomTranslationOptions} from 'pages/CompanyDetails/BasicInformation';
import {companyLanguageContextMap} from 'utils/utils';
import {useCurrentCurrency} from 'utils/currency';
import {MarkCompletedDialog} from 'pages/ServiceOrderDetails/Tabs/Overview/MarkCompletedDialog';
import {EmployeesView} from 'models/employee';
import {Confirm} from './Confirm';

interface BottomDrawerProps {
  serviceOrderDetails: ServiceOrderView;
}

export const JobOverviewBottomDrawer = ({
  serviceOrderDetails,
}: BottomDrawerProps) => {
  const theme = useTheme();
  const {t} = useTranslation();
  const {user} = useUserSession();
  const currentCurrency = useCurrentCurrency();

  const [openMarkCompletedDialog, setOpenMarkCompletedDialog] = useState(false);

  const {data: company} = useCompanyById(user?.userAccount.serviceCompany.id);
  const {t: translateCompanyLanguage} = useTranslation('translation', {
    lng: companyLanguageContextMap[company?.language as string],
  } as CustomTranslationOptions);

  const translate = useMemo(
    () => (key: string, options?: {context: string}) => {
      if (company?.language) {
        return translateCompanyLanguage(key, options);
      }

      return t(key, options);
    },
    [company?.language],
  );

  const {data: clientStorageData} = useQueryClientStorageData({
    serviceCompanyId: company?.id!,
    params: {key: 'pdf-template'},
  });

  const headerInfo = JSON.parse(clientStorageData?.value || '{}').header;
  const footerInfo = JSON.parse(clientStorageData?.value || '{}').footer;

  const {data: headerUrl = {}} = useDownloadUrl(
    headerInfo?.path ? [headerInfo.path] : [],
    undefined,
    company?.id,
  );

  const {data: footerUrl = {}} = useDownloadUrl(
    footerInfo?.path ? [footerInfo.path] : [],
    undefined,
    company?.id,
  );

  const defaultTechnicians = serviceOrderDetails.schedules.length
    ? serviceOrderDetails.schedules.map((s) => s.technician)
    : serviceOrderDetails.additionalInfo.candidateTechnicians?.length
    ? (serviceOrderDetails.additionalInfo
        .candidateTechnicians as unknown as EmployeesView[])
    : serviceOrderDetails.additionalInfo.candidateTechnician
    ? ([
        serviceOrderDetails.additionalInfo.candidateTechnician,
      ] as unknown as EmployeesView[])
    : null;

  const renderDialogTitle = () =>
    serviceOrderDetails.status === ServiceOrderStatus.SCHEDULED ||
    serviceOrderDetails.status === ServiceOrderStatus.IN_PROGRESS
      ? t('Reschedule Job')
      : t('Schedule Job');

  const {
    openCancelConfirm,
    openUnscheduleConfirm,
    openDialog,
    handleCancel,
    handleSchedule,
    confirmCancel,
    confirmUnschedule,
    setOpenCancelConfirm,
    setOpenUnscheduleConfirm,
    setOpenDialog,
  } = useServiceOrderActions(serviceOrderDetails);

  const {data: quotation} = useQuotationDetails(
    serviceOrderDetails?.additionalInfo.quotationId,
  );

  const {createAndSetPdfBlobUrl} = useCreateAndSetPdfBlobUrl({
    serviceOrder: serviceOrderDetails,
    quotation,
    userInfo: user?.userAccount,
    currentCurrency,
    headerInfo,
    headerPath: headerUrl[headerInfo?.path],
    footerInfo,
    footerPath: footerUrl[footerInfo?.path],
    translate,
    fileName: serviceOrderDetails?.number,
    selectedLng: company?.language,
  });

  const handleMenuItemClick = () => {
    createAndSetPdfBlobUrl();
  };

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          left: `calc(${theme.spacing(7)} - 1px)`,
          [theme.breakpoints.up('sm')]: {
            left: `calc(${theme.spacing(9)} - 1px)`,
          },
          right: 0,
          bottom: 0,
          background: theme.palette.background.paper,
          boxShadow: theme.shadows[3],
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0.6rem 2rem',
        }}>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleMenuItemClick}
            sx={{
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
              backgroundColor: 'white',
              margin: '0em 0.5rem',
            }}>
            {t('Download Job Overview')}
          </Button>

          {serviceOrderDetails.status === ServiceOrderStatus.SCHEDULED && (
            <Button
              sx={{cursor: 'pointer', margin: '0em 0.5rem', color: '#828DA3'}}
              onClick={handleSchedule}
              startIcon={
                <ScheduleOutlinedIcon
                  style={{color: theme.palette.action.disabled}}
                />
              }>
              {t('Reschedule')}
            </Button>
          )}

          {[ServiceOrderStatus.SCHEDULED, ServiceOrderStatus.OVERDUE].includes(
            serviceOrderDetails.status,
          ) && (
            <Button
              sx={{cursor: 'pointer', margin: '0em 0.5rem', color: '#828DA3'}}
              onClick={() => setOpenUnscheduleConfirm(true)}
              startIcon={
                <ScheduleOutlinedIcon
                  style={{color: theme.palette.action.disabled}}
                />
              }>
              {t('Unschedule')}
            </Button>
          )}

          {(serviceOrderDetails.status === ServiceOrderStatus.OVERDUE ||
            ![
              ServiceOrderStatus.SCHEDULED,
              ServiceOrderStatus.COMPLETED,
              ServiceOrderStatus.CANCELLED,
            ].includes(serviceOrderDetails.status)) && (
            <Button
              sx={{
                cursor: 'pointer',
                margin: '0em 0.5rem',
                color: '#828DA3',
              }}
              onClick={handleSchedule}
              startIcon={
                <ScheduleOutlinedIcon
                  style={{color: theme.palette.action.disabled}}
                />
              }>
              {t('Schedule')}
            </Button>
          )}

          {(serviceOrderDetails.status === ServiceOrderStatus.OVERDUE ||
            serviceOrderDetails.status === ServiceOrderStatus.SCHEDULED) && (
            <Button
              sx={{cursor: 'pointer', margin: '0em 0.5rem', color: '#828DA3'}}
              startIcon={
                <EditOutlinedIcon
                  style={{color: theme.palette.action.disabled}}
                />
              }
              onClick={() => setOpenMarkCompletedDialog(true)}>
              {t('Mark completed')}
            </Button>
          )}

          {serviceOrderDetails.status !== ServiceOrderStatus.CANCELLED &&
            serviceOrderDetails.status !== ServiceOrderStatus.COMPLETED && (
              <Button
                onClick={handleCancel}
                sx={{
                  cursor: 'pointer',
                  margin: '0em 0.5rem',
                  color: '#828DA3',
                }}>
                {t('Cancel')}
              </Button>
            )}
        </Box>

        <Box>
          <JobNotes serviceOrder={serviceOrderDetails} />
        </Box>
      </Box>

      <Confirm
        open={openCancelConfirm}
        onConfirm={confirmCancel}
        onClose={() => setOpenCancelConfirm(false)}
        title={t('Confirm')}
        content={t('Do you want to cancel the order?')}
      />

      <Confirm
        open={openUnscheduleConfirm}
        onConfirm={confirmUnschedule}
        onClose={() => setOpenUnscheduleConfirm(false)}
        title={t('Confirm')}
        content={t('Do you want to unschedule the service job?')}
      />

      <ScheduleDialog
        serviceOrderId={serviceOrderDetails.id}
        title={renderDialogTitle()}
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        defaultTechnicians={defaultTechnicians}
        defaultStartDate={
          serviceOrderDetails.schedules.length
            ? new Date(serviceOrderDetails.schedules[0].startTime)
            : null
        }
        defaultEndDate={
          serviceOrderDetails.schedules.length
            ? new Date(serviceOrderDetails.schedules[0].endTime)
            : null
        }
        defaultDueDate={
          serviceOrderDetails.dueDate
            ? new Date(serviceOrderDetails.dueDate)
            : null
        }
        defaultCallTime={
          serviceOrderDetails.additionalInfo?.callerInfo?.calledAt
            ? new Date(serviceOrderDetails.additionalInfo.callerInfo.calledAt)
            : null
        }
        defaultCallerName={serviceOrderDetails.additionalInfo?.callerInfo?.name}
        defaultPurchaseOrderNumber={
          serviceOrderDetails.additionalInfo.purchaseOrderNumber
        }
        defaultCallerPhoneNumber={
          serviceOrderDetails.additionalInfo?.callerInfo?.phoneNumber
        }
      />

      <MarkCompletedDialog
        serviceOrderDetails={serviceOrderDetails}
        title={t('Mark Completed')}
        open={openMarkCompletedDialog}
        onClose={() => setOpenMarkCompletedDialog(false)}
      />
    </>
  );
};
