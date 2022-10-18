import {useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import MUITooltip, {TooltipProps} from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import MoreIcon from '@mui/icons-material/MoreVert';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import Print from '@mui/icons-material/Print';
import Payments from '@mui/icons-material/Payments';
import FileDownload from '@mui/icons-material/FileDownload';
import Edit from '@mui/icons-material/Edit';
import RemoveRedEye from '@mui/icons-material/RemoveRedEye';
import {Confirm} from 'components/Confirm';
import {SendEmailDialog} from 'components/SendEmailDialog';
import {
  useDeleteInvoice,
  useInvoicePaymentStatus,
} from 'hooks/reactQuery/useInvoice';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {InvoiceStatus, InvoiceView} from 'models/invoice';

interface Props {
  invoice: InvoiceView;
}

const Tooltip = ({children, ...props}: TooltipProps) => (
  <MUITooltip
    PopperProps={{
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [0, -10],
          },
        },
      ],
    }}
    {...props}>
    {children}
  </MUITooltip>
);

export const Actions = ({invoice}: Props) => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSendEmailDialogOpen, setIsSendEmailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const {data: downloadUrl} = useDownloadUrl(
    invoice ? [invoice!.additionalInfo.pdfPath] : [],
  );
  const {mutate: markAsPaid} = useInvoicePaymentStatus();
  const {mutate: deleteInvoice} = useDeleteInvoice();

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const action = useMemo(() => {
    if (invoice.status === InvoiceStatus.DRAFT) {
      return (
        <Tooltip title={t('Send')} placement="left" arrow>
          <IconButton
            onClick={() => {
              setIsSendEmailDialogOpen(true);
            }}>
            <SendIcon fontSize="small" sx={{color: 'action.active'}} />
          </IconButton>
        </Tooltip>
      );
    }
    if (invoice.status === InvoiceStatus.NOT_PAID) {
      return (
        <Tooltip title={t('Payment')} placement="left" arrow>
          <IconButton onClick={() => setIsDialogOpen(true)}>
            <Payments fontSize="small" sx={{color: 'action.active'}} />
          </IconButton>
        </Tooltip>
      );
    }
    return (
      <Tooltip title={t('Preview')} placement="left" arrow>
        <IconButton onClick={() => navigate(`/invoices/details/${invoice.id}`)}>
          <RemoveRedEye fontSize="small" sx={{color: 'action.active'}} />
        </IconButton>
      </Tooltip>
    );
  }, [invoice.status]);

  const actions = useMemo(() => {
    const items = [];
    if (invoice.status === InvoiceStatus.DRAFT) {
      items.unshift({
        label: t('Print'),
        icon: <Print />,
        onClick: () => {
          // TODO: handle print
        },
      });
    } else if (invoice.status === InvoiceStatus.NOT_PAID) {
      items.unshift({
        label: t('Payment'),
        icon: <Payments />,
        onClick: () => setIsDialogOpen(true),
      });
    }
    if (
      invoice.status === InvoiceStatus.DRAFT ||
      invoice.status === InvoiceStatus.NOT_PAID
    ) {
      items.push({
        label: t('Preview'),
        icon: <RemoveRedEye />,
        onClick: () => {
          navigate(`/invoices/details/${invoice.id}`);
        },
      });
    }
    items.push(
      ...[
        {
          label: t('Download'),
          icon: <FileDownload />,
          onClick: () =>
            downloadUrl &&
            window.open(`${Object.values(downloadUrl)[0]}`, '_blank'),
        },
        {
          label: t('Edit'),
          icon: <Edit />,
          onClick: () => {
            navigate(`/invoices/details/${invoice.id}`);
          },
        },
        {
          label: t('Delete'),
          icon: <DeleteIcon />,
          onClick: () => {
            setIsDeleteDialogOpen(true);
          },
        },
      ],
    );
    return items;
  }, []);

  return (
    <Box>
      {action}

      <Tooltip title={t('More')} placement="right" arrow>
        <IconButton onClick={handleClick}>
          <MoreIcon fontSize="small" sx={{color: 'action.active'}} />
        </IconButton>
      </Tooltip>
      <Menu
        id="actions-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'actions-button',
        }}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}>
        {actions.map((item, index) => (
          <Box key={`${item.label}-${index}`}>
            <MenuItem
              onClick={() => {
                item.onClick();
                handleClose();
              }}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText>
                <Typography variant="body2">{item.label}</Typography>
              </ListItemText>
            </MenuItem>
            {actions[actions.length - 1] !== item && <Divider />}
          </Box>
        ))}
      </Menu>

      <Confirm
        open={isDialogOpen}
        onConfirm={() => {
          if (invoice.id) markAsPaid(invoice.id);
          setIsDialogOpen(false);
        }}
        onClose={() => setIsDialogOpen(false)}
        title="Mark as paid"
        content="Do you want to mark this invoice as paid?"
        helperText="This action is irreversible."
      />

      <SendEmailDialog
        invoice={invoice}
        open={isSendEmailDialogOpen}
        onConfirm={() => setIsSendEmailDialogOpen(false)}
        onClose={() => setIsSendEmailDialogOpen(false)}
      />

      <Confirm
        open={isDeleteDialogOpen}
        onConfirm={() => {
          if (invoice.id)
            deleteInvoice({invoiceId: invoice.id, shouldNavigate: false});
          setIsDeleteDialogOpen(false);
        }}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Delete Invoice"
        content="Do you want to delete this Invoice?"
        helperText="This action is irreversible."
      />
    </Box>
  );
};
