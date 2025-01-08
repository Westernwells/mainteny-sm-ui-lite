import {useMemo} from 'react';
import Print from '@mui/icons-material/Print';
import Edit from '@mui/icons-material/Edit';
import ReplayIcon from '@mui/icons-material/Replay';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';
import {QuotationStatus, QuotationView} from 'models/quotation';
import Check from '@mui/icons-material/Check';
import Close from '@mui/icons-material/Close';
import CopyAll from '@mui/icons-material/CopyAll';
import FileDownload from '@mui/icons-material/FileDownload';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import {MenuAction} from 'models/action';

type Props = {
  quotation: QuotationView;
  onDelete: () => void;
  onResend: () => void;
  onMarkAccepted: () => void;
  onMarkRejected: () => void;
  onDownload?: () => void;
  onSend?: () => void;
  onPrint?: () => void;
};

const useQuotationMenuActions = ({
  quotation,
  onDelete,
  onResend,
  onMarkAccepted,
  onMarkRejected,
  onDownload,
  onSend,
  onPrint,
}: Props) => {
  const {t} = useTranslation();
  const navigate = useNavigate();

  const actions = useMemo(() => {
    const items: MenuAction[] = [];

    if (onSend && quotation.status === QuotationStatus.DRAFT) {
      items.push({
        label: t('Send'),
        icon: <SendIcon />,
        onClick: onSend,
      });
    }

    if (quotation.status !== QuotationStatus.ACCEPTED) {
      items.push({
        label: t('Mark Accepted'),
        icon: <Check />,
        onClick: onMarkAccepted,
      });
    }

    if (quotation.status !== QuotationStatus.REJECTED) {
      items.push({
        label: t('Mark Rejected'),
        icon: <Close />,
        onClick: onMarkRejected,
      });
    }

    items.push({
      label: t('Duplicate'),
      icon: <CopyAll />,
      onClick: () => {
        navigate(`/quotations/new?id=${quotation.id}`);
      },
    });

    if (onDownload) {
      items.push({
        label: t('Download'),
        icon: <FileDownload />,
        onClick: onDownload,
      });
    }

    if (quotation.status === QuotationStatus.SENT_TO_CLIENT) {
      items.push({
        label: t('Resend'),
        icon: <ReplayIcon />,
        onClick: onResend,
      });
    }

    if (
      onPrint &&
      ![QuotationStatus.ACCEPTED, QuotationStatus.REJECTED].includes(
        quotation.status,
      )
    ) {
      items.push({
        label: t('Print'),
        icon: <Print />,
        onClick: onPrint,
      });
    }

    items.push({
      label: t('Delete'),
      icon: <DeleteIcon />,
      onClick: onDelete,
    });

    if (
      ![
        QuotationStatus.SENT_TO_CLIENT,
        QuotationStatus.ACCEPTED,
        QuotationStatus.REJECTED,
      ].includes(quotation.status)
    ) {
      items.push({
        label: t('Edit'),
        icon: <Edit />,
        onClick: () => navigate(`/quotations/details/${quotation.id}/edit`),
      });
    }

    return items;
  }, [quotation, t, onDownload, onPrint, onSend]);

  return {actions};
};

export default useQuotationMenuActions;
