import CompareArrowsOutlinedIcon from '@mui/icons-material/CompareArrowsOutlined';
import React, {useRef, useState} from 'react';
import {Action} from 'models/table';
import TableActionMenu from 'components/Table/TableActionMenu';
import ChangePaymentStatusDialog from 'pages/ServiceOrders/Tabs/ServiceOrderList.tsx/ChangePaymentStatusDialog';

type Props = {
  id: string;
};

const Actions = ({id}: Props) => {
  const [openPaymentStatusChange, setOpenPaymentStatusChange] = useState(false);
  const [open, setOpen] = useState<boolean>(false);

  const handleOpenDeleteConfirm = () => {
    setOpenPaymentStatusChange(true);
  };

  const handleClose = () => {
    setOpenPaymentStatusChange(false);
    setOpen(false);
  };

  const OPTIONS = useRef<Action[]>([
    {
      icon: CompareArrowsOutlinedIcon,
      label: 'Change payment status',
      onTrigger: handleOpenDeleteConfirm,
    },
  ]);

  return (
    <>
      <TableActionMenu
        options={OPTIONS.current}
        isOpen={open}
        onToggle={setOpen}
      />
      <ChangePaymentStatusDialog
        open={openPaymentStatusChange}
        id={id}
        onClose={handleClose}
      />
    </>
  );
};

export default Actions;
