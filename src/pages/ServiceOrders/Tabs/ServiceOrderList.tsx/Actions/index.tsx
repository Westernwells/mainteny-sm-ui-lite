import CompareArrowsOutlinedIcon from '@mui/icons-material/CompareArrowsOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import UndoIcon from '@mui/icons-material/Undo';
import React, {useMemo, useState} from 'react';
import {Action} from 'models/table';
import TableActionMenu from 'components/Table/TableActionMenu';
import ChangePaymentStatusDialog from 'pages/ServiceOrders/Tabs/ServiceOrderList.tsx/ChangePaymentStatusDialog';
import {
  useArchiveServiceOrder,
  useCancelServiceOrders,
  useUncompleteServiceOrder,
} from 'hooks/reactQuery/useServiceOrder';
import {ServiceOrderStatus} from 'models/service-order';
import {ARCHIVE_ACTION, CANCEL_ACTION} from 'models/status';

type Props = {
  id: string;
  status: ServiceOrderStatus;
};

const Actions = ({id, status}: Props) => {
  const [openPaymentStatusChange, setOpenPaymentStatusChange] = useState(false);
  const [open, setOpen] = useState<boolean>(false);

  const {mutateAsync: handleUncompleteServiceOrder} = useUncompleteServiceOrder(
    {
      serviceOrderId: id,
      message: 'Service job has been restored',
    },
  );

  const {mutateAsync: archiveServiceOrder} = useArchiveServiceOrder({
    serviceOrderId: id,
    action: ARCHIVE_ACTION.ARCHIVE,
    message: 'Service job has been archived',
  });
  const {mutateAsync: unarchiveServiceOrder} = useArchiveServiceOrder({
    serviceOrderId: id,
    action: ARCHIVE_ACTION.UNARCHIVE,
    message: 'Service job has been unarchived',
  });

  const {mutateAsync: cancelServiceOrder} = useCancelServiceOrders({
    serviceOrderId: id,
    action: CANCEL_ACTION.CANCEL,
  });
  const {mutateAsync: uncancelServiceOrder} = useCancelServiceOrders({
    serviceOrderId: id,
    action: CANCEL_ACTION.UNCANCEL,
    message: 'Service job has been restored',
  });

  const handleOpenDeleteConfirm = () => {
    setOpenPaymentStatusChange(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDeleteDialogClose = () => {
    setOpenPaymentStatusChange(false);
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

  const OPTIONS = useMemo<Action[]>(
    () => [
      {
        icon: CompareArrowsOutlinedIcon,
        label: 'Change payment status',
        onTrigger: handleOpenDeleteConfirm,
      },

      ...(![ServiceOrderStatus.ARCHIVED, ServiceOrderStatus.CANCELLED].includes(
        status,
      )
        ? [
            {
              icon: CancelOutlinedIcon,
              label: 'table_action_option.cancel',
              onTrigger: handleCancelClick(CANCEL_ACTION.CANCEL),
            },
          ]
        : []),

      ...(status === ServiceOrderStatus.CANCELLED
        ? [
            {
              icon: CancelOutlinedIcon,
              label: 'Undo cancellation',
              onTrigger: handleCancelClick(CANCEL_ACTION.UNCANCEL),
            },
          ]
        : []),

      ...(status !== ServiceOrderStatus.ARCHIVED
        ? [
            {
              icon: Inventory2OutlinedIcon,
              label: 'Archive',
              onTrigger: handleArchiveClick(ARCHIVE_ACTION.ARCHIVE),
            },
          ]
        : []),

      ...(status === ServiceOrderStatus.ARCHIVED
        ? [
            {
              icon: Inventory2OutlinedIcon,
              label: 'Unarchive',
              onTrigger: handleArchiveClick(ARCHIVE_ACTION.UNARCHIVE),
            },
          ]
        : []),

      ...(status === ServiceOrderStatus.COMPLETED
        ? [
            {
              icon: UndoIcon,
              label: 'Reopen',
              onTrigger: () => handleUncompleteServiceOrder(),
            },
          ]
        : []),
    ],
    [status],
  );

  return (
    <>
      <TableActionMenu options={OPTIONS} isOpen={open} onToggle={setOpen} />
      <ChangePaymentStatusDialog
        open={openPaymentStatusChange}
        id={id}
        onClose={handleDeleteDialogClose}
      />
    </>
  );
};

export default Actions;
