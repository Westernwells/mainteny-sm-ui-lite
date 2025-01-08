import React, {useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {InfoCard} from 'components/InfoCard';
import Grid from '@mui/material/Grid';
import {Confirm} from 'components/Confirm';
import {
  useArchiveServiceOrder,
  useCancelServiceOrders,
  useUncompleteServiceOrder,
  useUnscheduleServiceOrders,
} from 'hooks/reactQuery/useServiceOrder';
import {ServiceOrderView} from 'models/service-order';
import {ServiceOrderIcons} from 'components/ServiceOrderIcons';
import {StatusChip} from 'components/StatusChip';
import {
  getDefaultTechnician,
  getDialogTitle,
  getServiceOrderStatusColor,
  serviceOrderStatusToString,
} from 'utils/service-order-utils';
import {ServiceOrderTypeText} from 'components/ServiceOrderTypeText';
import {useTheme} from '@mui/material';
import {ARCHIVE_ACTION, CANCEL_ACTION} from 'models/status';
import useServiceOrderMenuActions from 'hooks/useServiceOrderMenuActions';
import ChangePaymentStatusDialog from 'pages/ServiceOrders/Tabs/ServiceOrderList.tsx/ChangePaymentStatusDialog';
import InfoCardMenu from 'components/InfoCardMenu';
import {useCompanyById} from 'hooks/reactQuery/useCompanies';
import {CustomTranslationOptions} from 'pages/CompanyDetails/BasicInformation';
import {useQueryClientStorageData} from 'hooks/useClientStorage';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {useQuotationDetails} from 'hooks/reactQuery/useQuotation';
import {useCreateAndSetPdfBlobUrl} from 'hooks/useCreateAndSetPdfBlobUrl';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {useCurrentCurrency} from 'utils/currency';
import {companyLanguageContextMap} from 'utils/language';
import {OrderInfo} from './schema';
import {MarkCompletedDialog} from './MarkCompletedDialog';
import {ScheduleDialog} from './ScheduleDialog';

interface Props {
  serviceOrderDetails: ServiceOrderView;
}

interface OrderInfoProps {
  serviceOrderDetails: ServiceOrderView;
  label: string;
  details: string[];
}

const customerDetailCells = ['customer', 'calledBy', 'purchaseOrderNumber'];
const unitDetailCells = ['unitAddress', 'unitNumber'];
const contractDetailCells = ['contractNumber', 'contractName', 'contractType'];
const jobDetailCells = ['technicians', 'dueDate', 'dateScheduled'];

const OrderInfoItem = ({
  serviceOrderDetails,
  label,
  details,
}: OrderInfoProps) => {
  const {t} = useTranslation();
  const theme = useTheme();
  return (
    <Grid
      item
      xs={3}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #0F4C6414',
        paddingRight: details ? '0.5em' : '0em',

        '&:nth-last-of-type(1)': {
          borderRight: 'none',
        },
      }}>
      <Typography variant="body2" color={theme.palette.text.secondary}>
        {t(label)}
      </Typography>
      {details &&
        details.map((item, index) => (
          <Grid item key={`${item}-${index}`} sx={{mt: '0.5em'}}>
            <OrderInfo serviceOrderDetails={serviceOrderDetails} label={item} />
          </Grid>
        ))}
    </Grid>
  );
};

export const OrderInfoCard = ({serviceOrderDetails}: Props) => {
  const {t} = useTranslation();
  const {user} = useUserSession();
  const currentCurrency = useCurrentCurrency();

  const [openCancelConfirm, setOpenCancelConfirm] = useState(false);
  const [openUnscheduleConfirm, setOpenUnscheduleConfirm] = useState(false);
  const [openPaymentStatusChange, setOpenPaymentStatusChange] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openMarkCompletedDialog, setOpenMarkCompletedDialog] = useState(false);
  const [open, setOpen] = useState<boolean>(false);

  const {mutate: unscheduleServiceOrder} = useUnscheduleServiceOrders();
  const {mutateAsync: handleUncompleteServiceOrder} = useUncompleteServiceOrder(
    {
      serviceOrderId: serviceOrderDetails.id,
      message: 'Service job has been restored',
    },
  );

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

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpenChangeClick = (value: boolean) => () => {
    setOpenPaymentStatusChange(value);
  };

  const handleArchiveClick = (action: ARCHIVE_ACTION) => async () => {
    if (action === ARCHIVE_ACTION.ARCHIVE) {
      await archiveServiceOrder();
    } else {
      await unarchiveServiceOrder();
    }
    handleClose();
  };

  const handleCancelClick = (action: CANCEL_ACTION) => async () => {
    if (action === CANCEL_ACTION.CANCEL) {
      await cancelServiceOrder();
    } else {
      await uncancelServiceOrder();
    }

    handleClose();
  };

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

  const {actions} = useServiceOrderMenuActions({
    serviceOrder: serviceOrderDetails,
    onChangeStatus: handleOpenChangeClick(true),
    onReopen: () => handleUncompleteServiceOrder(),
    onCancel: () => setOpenCancelConfirm(true),
    onUndoCancel: handleCancelClick(CANCEL_ACTION.UNCANCEL),
    onArchive: handleArchiveClick(ARCHIVE_ACTION.ARCHIVE),
    onUnarchive: handleArchiveClick(ARCHIVE_ACTION.UNARCHIVE),
    onSchedule: () => setOpenDialog(true),
    onReschedule: () => setOpenDialog(true),
    onUnschedule: () => setOpenUnscheduleConfirm(true),
    onMarkCompleted: () => setOpenMarkCompletedDialog(true),
    onDownload: handleMenuItemClick,
  });

  return (
    <InfoCard
      showHeaderBackground
      containerStyles={{display: 'flex', flexDirection: 'column'}}
      header={
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
          }}>
          <Box sx={{display: 'flex', height: '100%', alignItems: 'center'}}>
            <Box sx={{alignSelf: 'center'}}>
              <ServiceOrderIcons serviceOrderType={serviceOrderDetails.type} />
            </Box>

            <Box>
              <ServiceOrderTypeText
                variant="subtitle1"
                style={{ml: '0.5em'}}
                capitalizeText
                serviceOrderType={serviceOrderDetails.type}
              />
            </Box>

            <Typography
              component="div"
              variant="caption"
              sx={{
                ml: '0.4em',
                alignSelf: 'center',
              }}>
              {`#${serviceOrderDetails.externalId}`}
            </Typography>

            <StatusChip
              color={getServiceOrderStatusColor(serviceOrderDetails.status)}
              label={serviceOrderStatusToString(serviceOrderDetails.status)}
              style={{
                marginLeft: '2em',
              }}
            />
          </Box>

          <Box sx={{display: 'flex'}}>
            <Box sx={{mt: -1}}>
              <InfoCardMenu
                isOpen={open}
                options={actions}
                onToggle={setOpen}
              />
            </Box>
          </Box>
        </Box>
      }>
      <Grid container columnSpacing={4}>
        <OrderInfoItem
          label="Customer Details"
          details={customerDetailCells}
          serviceOrderDetails={serviceOrderDetails}
        />
        <OrderInfoItem
          label="Unit Details"
          details={unitDetailCells}
          serviceOrderDetails={serviceOrderDetails}
        />
        <OrderInfoItem
          label="Contract"
          details={contractDetailCells}
          serviceOrderDetails={serviceOrderDetails}
        />
        <OrderInfoItem
          label="Job"
          details={jobDetailCells}
          serviceOrderDetails={serviceOrderDetails}
        />
      </Grid>

      <Confirm
        open={openCancelConfirm}
        onConfirm={() => {
          cancelServiceOrder();
          setOpenCancelConfirm(false);
        }}
        onClose={() => setOpenCancelConfirm(false)}
        title="Confirm"
        content="Do you want to cancel the order?"
      />
      <Confirm
        open={openUnscheduleConfirm}
        onConfirm={() => {
          unscheduleServiceOrder(serviceOrderDetails.id);
          setOpenUnscheduleConfirm(false);
        }}
        onClose={() => setOpenUnscheduleConfirm(false)}
        title="Confirm"
        content="Do you want to unschedule the service job?"
      />

      <ScheduleDialog
        serviceOrderId={serviceOrderDetails.id}
        serviceOrderType={serviceOrderDetails.type}
        title={t(getDialogTitle(serviceOrderDetails))}
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        defaultTechnicians={getDefaultTechnician(serviceOrderDetails)}
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

      <ChangePaymentStatusDialog
        open={openPaymentStatusChange}
        id={serviceOrderDetails.id}
        onClose={handleOpenChangeClick(false)}
      />
    </InfoCard>
  );
};
