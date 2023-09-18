import {useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router';
import printJS from 'print-js';
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
import {MarkAsPaidDialog} from 'components/MarkAsPaidDialog';
import {ConfirmPrintInvoice} from 'components/ConfirmPrintInvoice';
import {useDeleteInvoice, usePublishInvoice} from 'hooks/reactQuery/useInvoice';
import {InvoiceStatus, InvoiceView, InvoiceType} from 'models/invoice';
import {PdfGenerationStatus} from 'models/misc';

interface Props {
  invoice: InvoiceView;
  downloadUrl: string;
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

export const Actions = ({invoice, downloadUrl}: Props) => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSendEmailDialogOpen, setIsSendEmailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isConfirmPrintDialogOpen, setIsConfirmPrintDialogOpen] =
    useState(false);
  const [isCreateCreditNoteDialogOpen, setIsCreateCreditNoteDialogOpen] =
    useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const {mutateAsync: publishInvoice} = usePublishInvoice({
    shouldNavigate: false,
  });

  const {mutate: deleteInvoice} = useDeleteInvoice();

  const isInvoicePDFGenerated =
    invoice.additionalInfo.pdfGenerationStatus === PdfGenerationStatus.DONE &&
    downloadUrl;
  const isWorkReportPDFGenerated = invoice?.additionalInfo?.includeWorkReport
    ? invoice?.serviceOrder?.additionalInfo.workReportGenerated
    : true;
  const isPDFsGenerated = !!isWorkReportPDFGenerated && isInvoicePDFGenerated;

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const action = useMemo(() => {
    if (invoice.status === InvoiceStatus.DRAFT) {
      return (
        <Tooltip
          title={
            isPDFsGenerated ? t('Send') : t('The PDFs are not generated yet.')
          }
          placement="left"
          arrow>
          <span>
            <IconButton
              onClick={() => {
                setIsSendEmailDialogOpen(true);
              }}
              sx={{color: 'action.active'}}
              disabled={!isPDFsGenerated}>
              <SendIcon fontSize="small" />
            </IconButton>
          </span>
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
  }, [invoice.status, downloadUrl]);

  const actions = useMemo(() => {
    const items = [];
    if (invoice.status === InvoiceStatus.EXPIRED) {
      items.unshift({
        label: t('Send Overdue Notice'),
        icon: <SendIcon />,
        onClick: () => navigate(`/invoices/overdue-notice/${invoice.id}`),
      });
    }
    if (isInvoicePDFGenerated && invoice.status === InvoiceStatus.DRAFT) {
      items.unshift({
        label: t('Print'),
        icon: <Print />,
        onClick: () => setIsConfirmPrintDialogOpen(true),
      });
    } else if (
      invoice.status === InvoiceStatus.NOT_PAID ||
      invoice.status === InvoiceStatus.EXPIRED ||
      invoice.status === InvoiceStatus.PARTIALLY_PAID
    ) {
      items.push({
        label: t('Payment'),
        icon: <Payments />,
        onClick: () => setIsDialogOpen(true),
      });
    }
    if (invoice.status !== InvoiceStatus.DRAFT) {
      items.push({
        label: t('Create Credit note'),
        icon: <Payments />,
        onClick: () => setIsCreateCreditNoteDialogOpen(true),
      });
    }
    if (invoice.status !== InvoiceStatus.PAID) {
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
        ...(isInvoicePDFGenerated
          ? [
              {
                label: t('Download'),
                icon: <FileDownload />,
                onClick: () => window.open(downloadUrl, '_blank'),
              },
            ]
          : []),
        {
          label: t('Edit'),
          icon: <Edit />,
          onClick: () => {
            navigate(`/invoices/details/${invoice.id}/edit`);
          },
        },
      ],
    );
    if (
      ![
        InvoiceStatus.NOT_PAID,
        InvoiceStatus.EXPIRED,
        InvoiceStatus.PARTIALLY_PAID,
      ].includes(invoice.status)
    ) {
      items.push({
        label: t('Delete'),
        icon: <DeleteIcon />,
        onClick: () => {
          setIsDeleteDialogOpen(true);
        },
      });
    }
    if (invoice.sentDate) {
      return items.filter((item) => item.label !== t('Edit'));
    }
    return items;
  }, [downloadUrl]);

  const onPrintInvoice = async () => {
    await publishInvoice(
      {
        id: invoice.id,
        body: {
          email: '',
          subject: '',
          content: '',
        },
      },
      {
        onSuccess: () => {
          setIsConfirmPrintDialogOpen(false);
          setTimeout(() => {
            if (downloadUrl) {
              printJS({
                printable: downloadUrl,
                type: 'pdf',
                showModal: true,
              });
            }
          }, 6000);
        },
      },
    );
  };

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
          sx: {width: '210px'},
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
            {(actions.length > 3 && actions.length - 3 < index) ||
            (actions.length <= 3 && actions.length - 1 === index) ? (
              <Divider />
            ) : null}
            <MenuItem
              onClick={() => {
                item.onClick();
                handleClose();
              }}
              sx={{py: '0.7rem'}}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText>
                <Typography variant="body2">{item.label}</Typography>
              </ListItemText>
            </MenuItem>
          </Box>
        ))}
      </Menu>

      <MarkAsPaidDialog
        invoice={invoice}
        open={isDialogOpen}
        onConfirm={() => setIsDialogOpen(false)}
        onClose={() => setIsDialogOpen(false)}
      />

      <SendEmailDialog
        open={isSendEmailDialogOpen}
        onConfirm={() => setIsSendEmailDialogOpen(false)}
        onClose={() => setIsSendEmailDialogOpen(false)}
        id={invoice.id}
        submitHook={usePublishInvoice}
        confirmBtnDisabled={!isPDFsGenerated}
        email={
          invoice.propertyOwner?.additionalInfo.billingEmail ||
          invoice.propertyOwner?.contact.email
        }
        subject={t(
          `${invoice.propertyOwner?.name} - ${t('Invoice')} {{invoiceNumber}}`,
          {
            invoiceNumber: invoice?.number ?? '',
          },
        )}
        content={invoice.description}
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

      <ConfirmPrintInvoice
        open={isConfirmPrintDialogOpen}
        onConfirm={onPrintInvoice}
        onClose={() => setIsConfirmPrintDialogOpen(false)}
      />

      <Confirm
        open={isCreateCreditNoteDialogOpen}
        onConfirm={() => {
          setIsCreateCreditNoteDialogOpen(false);
          navigate(
            `/invoices/new?invoiceId=${invoice.id}&invoiceType=${InvoiceType.CREDIT_NOTE}`,
          );
        }}
        onClose={() => setIsCreateCreditNoteDialogOpen(false)}
        title="Create Credit note"
        content="This action will create a credit note from this invoice details."
        helperText="Do you want to proceed?"
      />
    </Box>
  );
};
