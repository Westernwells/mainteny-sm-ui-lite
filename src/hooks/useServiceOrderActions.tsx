import {useState} from 'react';
import {
  useCancelServiceOrders,
  useUnscheduleServiceOrders,
} from 'hooks/reactQuery/useServiceOrder';
import {ServiceOrderView} from 'models/service-order';
import {CANCEL_ACTION} from 'models/status';

export const useServiceOrderActions = (
  serviceOrderDetails: ServiceOrderView,
) => {
  const {mutate: cancelServiceOrder} = useCancelServiceOrders({
    serviceOrderId: serviceOrderDetails.id,
    action: CANCEL_ACTION.CANCEL,
  });
  const {mutate: unscheduleServiceOrder} = useUnscheduleServiceOrders();

  const [openCancelConfirm, setOpenCancelConfirm] = useState(false);
  const [openUnscheduleConfirm, setOpenUnscheduleConfirm] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const handleCancel = () => {
    setOpenCancelConfirm(true);
  };

  const handleUnschedule = () => {
    setOpenUnscheduleConfirm(true);
  };

  const handleSchedule = () => {
    setOpenDialog(true);
  };

  const confirmCancel = () => {
    cancelServiceOrder();
    setOpenCancelConfirm(false);
  };

  const confirmUnschedule = () => {
    unscheduleServiceOrder(serviceOrderDetails.id);
    setOpenUnscheduleConfirm(false);
  };

  return {
    openCancelConfirm,
    openUnscheduleConfirm,
    openDialog,
    setOpenCancelConfirm,
    setOpenUnscheduleConfirm,
    setOpenDialog,
    handleCancel,
    handleUnschedule,
    handleSchedule,
    confirmCancel,
    confirmUnschedule,
  };
};
