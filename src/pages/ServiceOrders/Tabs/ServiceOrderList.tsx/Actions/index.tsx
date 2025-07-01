import {useMemo, useState} from 'react';
import TableActionMenu from 'components/Table/TableActionMenu';
import ChangePaymentStatusDialog from 'pages/ServiceOrders/Tabs/ServiceOrderList.tsx/ChangePaymentStatusDialog';
import {
  useArchiveServiceOrder,
  useCancelServiceOrders,
  useUncompleteServiceOrder,
  useUnscheduleServiceOrders,
} from 'hooks/reactQuery/useServiceOrder';
import {ServiceOrderView} from 'models/service-order';
import {ARCHIVE_ACTION, CANCEL_ACTION} from 'models/status';
import useServiceOrderMenuActions from 'hooks/useServiceOrderMenuActions';
import {ScheduleDialog} from 'pages/ServiceOrderDetails/Tabs/Overview/ScheduleDialog';
import {getDefaultTechnician, getDialogTitle} from 'utils/service-order-utils';
import {useTranslation} from 'react-i18next';
import {Confirm} from 'components/Confirm';
import {MarkCompletedDialog} from 'pages/ServiceOrderDetails/Tabs/Overview/MarkCompletedDialog';
import {useCompanyById} from 'hooks/reactQuery/useCompanies';
import {CustomTranslationOptions} from 'pages/CompanyDetails/BasicInformation';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {useCurrentCurrency} from 'utils/currency';
import {companyLanguageContextMap} from 'utils/language';
import {useCreateAndSetPdfBlobUrl} from 'hooks/useCreateAndSetPdfBlobUrl';

type Props = {
  serviceOrder: ServiceOrderView;
};

const Actions = ({serviceOrder}: Props) => {
  const {t} = useTranslation();
  const {user} = useUserSession();
  const currentCurrency = useCurrentCurrency();

  const [openPaymentStatusChange, setOpenPaymentStatusChange] = useState(false);
  const [open, setOpen] = useState<boolean>(false);
  const [openScheduleDialog, setOpenScheduleDialog] = useState(false);
  const [openUnscheduleConfirm, setOpenUnscheduleConfirm] = useState(false);
  const [openMarkCompletedDialog, setOpenMarkCompletedDialog] = useState(false);

  const {mutateAsync: handleUncompleteServiceOrder} = useUncompleteServiceOrder(
    {
      serviceOrderId: serviceOrder.id,
      message: 'Service job has been restored',
    },
  );

  const {mutateAsync: archiveServiceOrder} = useArchiveServiceOrder({
    serviceOrderId: serviceOrder.id,
    action: ARCHIVE_ACTION.ARCHIVE,
    message: 'Service job has been archived',
  });
  const {mutateAsync: unarchiveServiceOrder} = useArchiveServiceOrder({
    serviceOrderId: serviceOrder.id,
    action: ARCHIVE_ACTION.UNARCHIVE,
    message: 'Service job has been unarchived',
  });

  const {mutateAsync: cancelServiceOrder} = useCancelServiceOrders({
    serviceOrderId: serviceOrder.id,
    action: CANCEL_ACTION.CANCEL,
  });
  const {mutateAsync: uncancelServiceOrder} = useCancelServiceOrders({
    serviceOrderId: serviceOrder.id,
    action: CANCEL_ACTION.UNCANCEL,
    message: 'Service job has been restored',
  });

  const {mutate: unscheduleServiceOrder} = useUnscheduleServiceOrders();

  const handleOpenChangeClick = (value: boolean) => () => {
    setOpenPaymentStatusChange(value);
  };

  const handleClose = () => {
    setOpen(false);
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

  const {createAndSetPdfBlobUrl} = useCreateAndSetPdfBlobUrl({
    serviceOrder,
    userInfo: user?.userAccount,
    currentCurrency,
    translate,
    fileName: serviceOrder?.number || '',
    selectedLng: company?.language,
  });

  const handleMenuItemClick = async () => {
    await createAndSetPdfBlobUrl();
  };

  const {actions} = useServiceOrderMenuActions({
    serviceOrder,
    onChangeStatus: handleOpenChangeClick(true),
    onReopen: () => handleUncompleteServiceOrder(),
    onCancel: handleCancelClick(CANCEL_ACTION.CANCEL),
    onUndoCancel: handleCancelClick(CANCEL_ACTION.UNCANCEL),
    onArchive: handleArchiveClick(ARCHIVE_ACTION.ARCHIVE),
    onUnarchive: handleArchiveClick(ARCHIVE_ACTION.UNARCHIVE),
    onSchedule: () => setOpenScheduleDialog(true),
    onReschedule: () => setOpenScheduleDialog(true),
    onUnschedule: () => setOpenUnscheduleConfirm(true),
    onMarkCompleted: () => setOpenMarkCompletedDialog(true),
    onDownload: handleMenuItemClick,
  });

  return (
    <>
      <TableActionMenu options={actions} isOpen={open} onToggle={setOpen} />
      <ChangePaymentStatusDialog
        open={openPaymentStatusChange}
        id={serviceOrder.id}
        onClose={handleOpenChangeClick(false)}
      />

      {openScheduleDialog && (
        <ScheduleDialog
          serviceOrderId={serviceOrder.id}
          serviceOrderType={serviceOrder?.type}
          title={t(getDialogTitle(serviceOrder))}
          open={openScheduleDialog}
          onClose={() => setOpenScheduleDialog(false)}
          defaultTechnicians={getDefaultTechnician(serviceOrder)}
          defaultStartDate={
            serviceOrder.schedules.length &&
            serviceOrder.schedules[0]?.startTime
              ? new Date(serviceOrder.schedules[0]?.startTime)
              : null
          }
          defaultEndDate={
            serviceOrder.schedules.length && serviceOrder.schedules[0]?.endTime
              ? new Date(serviceOrder.schedules[0].endTime)
              : null
          }
          defaultDueDate={
            serviceOrder.dueDate ? new Date(serviceOrder.dueDate) : null
          }
          defaultCallTime={
            serviceOrder.additionalInfo?.callerInfo?.calledAt
              ? new Date(serviceOrder.additionalInfo.callerInfo.calledAt)
              : null
          }
          defaultCallerName={serviceOrder.additionalInfo?.callerInfo?.name}
          defaultPurchaseOrderNumber={
            serviceOrder.additionalInfo.purchaseOrderNumber
          }
          defaultCallerPhoneNumber={
            serviceOrder.additionalInfo?.callerInfo?.phoneNumber
          }
        />
      )}

      {openUnscheduleConfirm && (
        <Confirm
          open={openUnscheduleConfirm}
          onConfirm={() => {
            unscheduleServiceOrder(serviceOrder.id);
            setOpenUnscheduleConfirm(false);
          }}
          onClose={() => setOpenUnscheduleConfirm(false)}
          title="Confirm"
          content="Do you want to unschedule the service job?"
        />
      )}

      {openMarkCompletedDialog && (
        <MarkCompletedDialog
          serviceOrderDetails={serviceOrder}
          title={t('Mark Completed')}
          open={openMarkCompletedDialog}
          onClose={() => setOpenMarkCompletedDialog(false)}
        />
      )}
    </>
  );
};

export default Actions;
