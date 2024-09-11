import {useState} from 'react';
import {
  useCancelServiceOrders,
  useUnscheduleServiceOrders,
} from 'hooks/reactQuery/useServiceOrder';
import {ServiceOrderView} from 'models/service-order';

export const useServiceOrderActions = (
  serviceOrderDetails: ServiceOrderView,
) => {
  const {mutate: cancelServiceOrder} = useCancelServiceOrders();
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
    cancelServiceOrder(serviceOrderDetails.id);
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
