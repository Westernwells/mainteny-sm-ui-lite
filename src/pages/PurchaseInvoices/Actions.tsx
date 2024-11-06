import CompareArrowsOutlinedIcon from '@mui/icons-material/CompareArrowsOutlined';
import {useRef, useState} from 'react';
import {Action} from 'models/table';
import TableActionMenu from 'components/Table/TableActionMenu';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {useNavigate} from 'react-router-dom';
import {Confirm} from 'components/Confirm';
import {useDeletePurchaseInvoice} from 'hooks/reactQuery/usePurchaseInvoice';
import {useSnackbar} from 'hooks/useSnackbar';
import CustomSnackbar from 'components/CustomSnackbar';
import ChangePurchaseInvoiceStatusDialog from './ChangePurchaseInvoiceStatusDialog';

type Props = {
  id: string;
};

const Actions = ({id}: Props) => {
  const navigate = useNavigate();
  const {enqueueSnackbar} = useSnackbar();
  const [openPaymentStatusChange, setOpenPaymentStatusChange] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [open, setOpen] = useState<boolean>(false);

  const {mutateAsync: deletePurchaseInvoice, isLoading: isDeleting} =
    useDeletePurchaseInvoice();

  const handleOpenDeleteConfirm = () => {
    setOpenPaymentStatusChange(true);
  };

  const handleClose = () => {
    setOpenPaymentStatusChange(false);
    setOpen(false);
  };

  const handleDeleteInvoice = () => {
    if (id)
      deletePurchaseInvoice(
        {invoiceId: id, shouldNavigate: false},
        {
          onSuccess: () => {
            enqueueSnackbar(
              <CustomSnackbar message="Invoice deleted" snackIcon="delete" />,
              {
                variant: 'info',
                anchorOrigin: {horizontal: 'right', vertical: 'bottom'},
              },
            );
          },
        },
      );
  };

  const OPTIONS = useRef<Action[]>([
    {
      icon: CompareArrowsOutlinedIcon,
      label: 'Change status',
      onTrigger: handleOpenDeleteConfirm,
    },
    {
      icon: EditIcon,
      label: 'Edit',
      onTrigger: () => navigate(`/purchase-invoices/details/${id}/edit`),
    },
    {
      icon: DeleteIcon,
      label: 'Delete',
      onTrigger: () => setOpenDeleteConfirm(true),
    },
  ]);

  return (
    <>
      <TableActionMenu
        options={OPTIONS.current}
        isOpen={open}
        onToggle={setOpen}
      />

      <ChangePurchaseInvoiceStatusDialog
        open={openPaymentStatusChange}
        id={id}
        onClose={handleClose}
      />

      <Confirm
        maxWidth={400}
        disableActions={isDeleting}
        open={openDeleteConfirm}
        onConfirm={() => {
          handleDeleteInvoice();
          setOpenDeleteConfirm(false);
        }}
        onClose={() => setOpenDeleteConfirm(false)}
        title="Delete Invoice"
        content="You are about to delete this invoice. Are you sure about it?"
      />
    </>
  );
};

export default Actions;
