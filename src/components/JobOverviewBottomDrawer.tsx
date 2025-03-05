import React, {useMemo, useState} from 'react';
import {Box, Button} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {useTheme} from '@mui/material/styles';
import JobNotes from 'pages/ServiceOrderDetails/JobNotes';
import {ServiceOrderView} from 'models/service-order';
import {useServiceOrderActions} from 'hooks/useServiceOrderActions';
import {useQuotationDetails} from 'hooks/reactQuery/useQuotation';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {useCompanyById} from 'hooks/reactQuery/useCompanies';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {useQueryClientStorageData} from 'hooks/useClientStorage';
import {useCreateAndSetPdfBlobUrl} from 'hooks/useCreateAndSetPdfBlobUrl';
import {CustomTranslationOptions} from 'pages/CompanyDetails/BasicInformation';
import {useCurrentCurrency} from 'utils/currency';
import {MarkCompletedDialog} from 'pages/ServiceOrderDetails/Tabs/Overview/MarkCompletedDialog';
import useServiceOrderMenuActions from 'hooks/useServiceOrderMenuActions';
import {ARCHIVE_ACTION, CANCEL_ACTION} from 'models/status';
import {
  useArchiveServiceOrder,
  useCancelServiceOrders,
} from 'hooks/reactQuery/useServiceOrder';
import ChangePaymentStatusDialog from 'pages/ServiceOrders/Tabs/ServiceOrderList.tsx/ChangePaymentStatusDialog';
import {MenuAction} from 'models/action';
import {companyLanguageContextMap} from 'utils/language';
import {Confirm} from './Confirm';

interface BottomDrawerProps {
  serviceOrderDetails: ServiceOrderView;
  onOpenRescheduleDialog: (value: boolean) => void;
}

export const JobOverviewBottomDrawer = ({
  serviceOrderDetails,
  onOpenRescheduleDialog,
}: BottomDrawerProps) => {
  const theme = useTheme();
  const {t} = useTranslation();
  const {user} = useUserSession();
  const currentCurrency = useCurrentCurrency();

  const [openMarkCompletedDialog, setOpenMarkCompletedDialog] = useState(false);
  const [openPaymentStatusChange, setOpenPaymentStatusChange] = useState(false);

  const {mutateAsync: archiveServiceOrder} = useArchiveServiceOrder({
    serviceOrderId: serviceOrderDetails.id,
    action: ARCHIVE_ACTION.ARCHIVE,
    message: 'Service job has been archived',
  });
  const {mutateAsync: unarchiveServiceOrder} = useArchiveServiceOrder({
    serviceOrderId: serviceOrderDetails.id,
    action: ARCHIVE_ACTION.UNARCHIVE,
    message: 'Service job has been unarchived',
  });

  const {mutateAsync: cancelServiceOrder} = useCancelServiceOrders({
    serviceOrderId: serviceOrderDetails.id,
    action: CANCEL_ACTION.CANCEL,
  });
  const {mutateAsync: uncancelServiceOrder} = useCancelServiceOrders({
    serviceOrderId: serviceOrderDetails.id,
    action: CANCEL_ACTION.UNCANCEL,
    message: 'Service job has been restored',
  });

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

  const {
    openCancelConfirm,
    openUnscheduleConfirm,
    handleUncompleteServiceOrder,
    handleCancel,
    handleSchedule,
    confirmCancel,
    confirmUnschedule,
    setOpenCancelConfirm,
    setOpenUnscheduleConfirm,
  } = useServiceOrderActions({
    id: serviceOrderDetails.id,
    externalSetOpenDialog: onOpenRescheduleDialog,
  });

  const handleArchiveClick = (action: ARCHIVE_ACTION) => async () => {
    if (action === ARCHIVE_ACTION.ARCHIVE) {
      await archiveServiceOrder();
    } else {
      await unarchiveServiceOrder();
    }
  };

  const handleCancelClick = (action: CANCEL_ACTION) => async () => {
    if (action === CANCEL_ACTION.CANCEL) {
      await cancelServiceOrder();
    } else {
      await uncancelServiceOrder();
    }
  };

  const handleOpenChangeConfirm = () => {
    setOpenPaymentStatusChange(true);
  };

  const handleDeleteDialogClose = () => {
    setOpenPaymentStatusChange(false);
  };

  const {actions} = useServiceOrderMenuActions({
    serviceOrder: serviceOrderDetails,
    onChangeStatus: handleOpenChangeConfirm,
    onReopen: () => handleUncompleteServiceOrder(),
    onCancel: handleCancel,
    onUndoCancel: handleCancelClick(CANCEL_ACTION.UNCANCEL),
    onArchive: handleArchiveClick(ARCHIVE_ACTION.ARCHIVE),
    onUnarchive: handleArchiveClick(ARCHIVE_ACTION.UNARCHIVE),
    onSchedule: handleSchedule,
    onReschedule: handleSchedule,
    onUnschedule: () => setOpenUnscheduleConfirm(true),
    onMarkCompleted: () => setOpenMarkCompletedDialog(true),
    onDownload: () => handleMenuItemClick,
  });

  const {hasDownloadAction, actionsWithoutDownload} = useMemo(
    () =>
      actions.reduce(
        (acc, current) => {
          if (current.label === t('Download'))
            return {
              hasDownloadAction: true,
              actionsWithoutDownload: [...acc.actionsWithoutDownload],
            };
          return {
            hasDownloadAction: acc.hasDownloadAction,
            actionsWithoutDownload: [...acc.actionsWithoutDownload, current],
          };
        },
        {
          hasDownloadAction: false,
          actionsWithoutDownload: [] as MenuAction[],
        },
      ),
    [actions],
  );

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          zIndex: 20,
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
          {hasDownloadAction && (
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
          )}
          {actionsWithoutDownload.map((action) => (
            <Button
              sx={{cursor: 'pointer', margin: '0em 0.5rem', color: '#828DA3'}}
              onClick={action.onClick}
              startIcon={action.icon}
              key={action.label}>
              {action.label}
            </Button>
          ))}
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

      <MarkCompletedDialog
        serviceOrderDetails={serviceOrderDetails}
        title={t('Mark Completed')}
        open={openMarkCompletedDialog}
        onClose={() => setOpenMarkCompletedDialog(false)}
      />

      <ChangePaymentStatusDialog
        open={openPaymentStatusChange}
        id={serviceOrderDetails.id}
        onClose={handleDeleteDialogClose}
      />
    </>
  );
};
