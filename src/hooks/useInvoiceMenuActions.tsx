import {useMemo} from 'react';
import {InvoiceStatus, InvoiceType, InvoiceView} from 'models/invoice';
import SendIcon from '@mui/icons-material/Send';
import RemoveRedEye from '@mui/icons-material/RemoveRedEye';
import Print from '@mui/icons-material/Print';
import Payments from '@mui/icons-material/Payments';
import CopyAll from '@mui/icons-material/CopyAll';
import FileDownload from '@mui/icons-material/FileDownload';
import Edit from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from '@mui/icons-material/Cancel';
import ReplayIcon from '@mui/icons-material/Replay';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';
import {MenuAction} from 'models/action';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

type Props = {
  invoice: InvoiceView;
  showPreview?: boolean;
  showSend?: boolean;
  onSend: () => void;
  onPrint: () => void;
  onCreateCreditNote: () => void;
  onDownload: () => void;
  onDelete: () => void;
  onCancel: () => void;
  onUndoCancel: () => void;
  onResend: () => void;
  onPayment?: () => void;
};

const useInvoiceMenuActions = ({
  invoice,
  showPreview = true,
  showSend = true,
  onSend,
  onPrint,
  onCreateCreditNote,
  onDownload,
  onDelete,
  onCancel,
  onUndoCancel,
  onResend,
  onPayment,
}: Props) => {
  const {t} = useTranslation();
  const navigate = useNavigate();

  const actions = useMemo(() => {
    const items: MenuAction[] = [];

    if (showSend && invoice.status === InvoiceStatus.DRAFT) {
      items.push({
        label: t('Send'),
        icon: <SendIcon />,
        onClick: onSend,
      });
    }

    if (showPreview) {
      items.push({
        label: t('Preview'),
        icon: <RemoveRedEye />,
        onClick: () => {
          navigate(`/invoices/details/${invoice.id}`);
        },
      });
    }

    if (
      [InvoiceStatus.DRAFT, InvoiceStatus.CREDITED].includes(invoice.status)
    ) {
      items.push({
        label: t('Print'),
        icon: <Print />,
        onClick: onPrint,
      });
    }

    if (
      onPayment &&
      [
        InvoiceStatus.NOT_PAID,
        InvoiceStatus.PARTIALLY_PAID,
        InvoiceStatus.EXPIRED,
        InvoiceStatus.CREDITED,
      ].includes(invoice.status)
    ) {
      items.push({
        label: t('Payment'),
        icon: <Payments />,
        onClick: () => {
          onPayment?.();
        },
      });
    }

    if (
      [
        InvoiceStatus.NOT_PAID,
        InvoiceStatus.PARTIALLY_PAID,
        InvoiceStatus.EXPIRED,
        InvoiceStatus.PAID,
      ].includes(invoice.status)
    ) {
      items.push({
        label: t('Create Credit note'),
        icon: <Payments />,
        onClick: onCreateCreditNote,
      });
    }

    if ([InvoiceType.FULL, InvoiceType.AGGREGATE].includes(invoice.type)) {
      items.push({
        label: t('Duplicate'),
        icon: <CopyAll />,
        onClick: () => {
          navigate(`/invoices/new?invoiceId=${invoice.id}&isDuplicate=true`);
        },
      });
    }

    items.push({
      label: t('Download'),
      icon: <FileDownload />,
      onClick: onDownload,
    });

    if (invoice.status === InvoiceStatus.DRAFT || !invoice.sentDate) {
      items.push({
        label: t('Edit'),
        icon: <Edit />,
        onClick: () => {
          navigate(`/invoices/details/${invoice.id}/edit`);
        },
      });
    }

    if (
      ![
        InvoiceStatus.NOT_PAID,
        InvoiceStatus.EXPIRED,
        InvoiceStatus.CANCELLED,
      ].includes(invoice.status) ||
      !invoice.sentDate
    ) {
      items.push({
        label: t('Delete'),
        icon: <DeleteIcon />,
        onClick: onDelete,
      });
    }

    if (
      [
        InvoiceStatus.NOT_PAID,
        InvoiceStatus.EXPIRED,
        InvoiceStatus.CREDITED,
      ].includes(invoice.status)
    ) {
      items.push({
        label: t('table_action_option.cancel'), // Cancel
        icon: <CancelIcon />,
        onClick: onCancel,
      });
    }

    if (invoice.status === InvoiceStatus.CANCELLED) {
      items.push({
        label: t('Undo cancellation'),
        icon: <CancelOutlinedIcon />,
        onClick: onUndoCancel,
      });
    }

    if (
      [InvoiceStatus.EXPIRED, InvoiceStatus.PARTIALLY_PAID].includes(
        invoice.status,
      )
    ) {
      items.push({
        label: t('Send Overdue Notice'),
        icon: <SendIcon />,
        onClick: () => navigate(`/invoices/${invoice.id}/overdue-notice`),
      });
    }

    if (invoice.status === InvoiceStatus.NOT_PAID) {
      items.push({
        label: t('Resend'),

        icon: <ReplayIcon />,
        onClick: onResend,
      });
    }

    return items;
  }, [invoice, t, showPreview]);

  return {actions};
};

export default useInvoiceMenuActions;
