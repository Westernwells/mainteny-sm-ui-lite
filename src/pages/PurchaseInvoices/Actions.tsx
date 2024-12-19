import CompareArrowsOutlinedIcon from '@mui/icons-material/CompareArrowsOutlined';
import {useRef, useState} from 'react';
import TableActionMenu from 'components/Table/TableActionMenu';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {useLocation, useNavigate} from 'react-router-dom';
import {Confirm} from 'components/Confirm';
import {useDeletePurchaseInvoice} from 'hooks/reactQuery/usePurchaseInvoice';
import {useSnackbar} from 'hooks/useSnackbar';
import CustomSnackbar from 'components/CustomSnackbar';
import {MenuAction} from 'models/action';
import {useTranslation} from 'react-i18next';
import ChangePurchaseInvoiceStatusDialog from './ChangePurchaseInvoiceStatusDialog';

type Props = {
  id: string;
};

const Actions = ({id}: Props) => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
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

  const OPTIONS = useRef<MenuAction[]>([
    {
      icon: <CompareArrowsOutlinedIcon />,
      label: t('Change status'),
      onClick: handleOpenDeleteConfirm,
    },
    {
      icon: <EditIcon />,
      label: t('Edit'),
      onClick: () =>
        navigate(`/purchase-invoices/details/${id}/edit`, {
          state: {
            from: location?.pathname?.includes('/orders')
              ? location?.pathname
              : `/purchase-invoices/`,
          },
        }),
    },
    {
      icon: <DeleteIcon />,
      label: t('Delete'),
      onClick: () => setOpenDeleteConfirm(true),
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
