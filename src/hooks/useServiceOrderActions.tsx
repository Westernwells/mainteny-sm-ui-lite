import {useState} from 'react';
import {
  useCancelServiceOrders,
  useUncompleteServiceOrder,
  useUnscheduleServiceOrders,
} from 'hooks/reactQuery/useServiceOrder';
import {CANCEL_ACTION} from 'models/status';

type UseServiceOrderActionsProps = {
  id: string;
  externalSetOpenDialog?: (value: boolean) => void;
};

export const useServiceOrderActions = ({
  id,
  externalSetOpenDialog,
}: UseServiceOrderActionsProps) => {
  const {mutate: cancelServiceOrder} = useCancelServiceOrders({
    serviceOrderId: id,
    action: CANCEL_ACTION.CANCEL,
  });

  const {mutate: unscheduleServiceOrder} = useUnscheduleServiceOrders();

  const {mutateAsync: handleUncompleteServiceOrder} = useUncompleteServiceOrder(
    {
      serviceOrderId: id,
      message: 'Service job has been restored',
    },
  );

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
    externalSetOpenDialog?.(true);
  };

  const handleChangeOpenDialog = (value: boolean) => {
    setOpenDialog(value);
    externalSetOpenDialog?.(value);
  };

  const confirmCancel = () => {
    cancelServiceOrder();
    setOpenCancelConfirm(false);
  };

  const confirmUnschedule = () => {
    unscheduleServiceOrder(id);
    setOpenUnscheduleConfirm(false);
  };

  return {
    openCancelConfirm,
    openUnscheduleConfirm,
    openDialog,
    handleUncompleteServiceOrder,
    setOpenCancelConfirm,
    setOpenUnscheduleConfirm,
    setOpenDialog: handleChangeOpenDialog,
    handleCancel,
    handleUnschedule,
    handleSchedule,
    confirmCancel,
    confirmUnschedule,
  };
};
