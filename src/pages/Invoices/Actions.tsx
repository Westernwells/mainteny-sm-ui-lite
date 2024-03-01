import {useCallback, useContext, useEffect, useMemo, useState} from 'react';
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
import CancelIcon from '@mui/icons-material/Cancel';
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
import {LanguageContext} from 'context/LanguageProvider';
import {
  useCancelInvoice,
  useDeleteInvoice,
  usePublishInvoice,
} from 'hooks/reactQuery/useInvoice';
import {InvoiceStatus, InvoiceView, InvoiceType} from 'models/invoice';
import {
  useDownloadFileWithCustomName,
  useDownloadUrl,
} from 'hooks/reactQuery/useDownloadUrl';
import {useSnackbar} from 'hooks/useSnackbar';
import CustomSnackbar from 'components/CustomSnackbar';
import {getInvoicePDFStatuses, validateDueDate} from 'utils/invoice-utils';

interface Props {
  invoice: InvoiceView;
  downloadUrl: string;
  isInvoiceList?: boolean;
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

export const Actions = ({
  invoice,
  downloadUrl,
  isInvoiceList = true,
}: Props) => {
  const {t} = useTranslation();
  const {language: selectedLng} = useContext(LanguageContext);
  const navigate = useNavigate();
  const {enqueueSnackbar} = useSnackbar();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSendEmailDialogOpen, setIsSendEmailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCancelledDialogOpen, setIsCancelledDialogOpen] = useState(false);
  const [isConfirmPrintDialogOpen, setIsConfirmPrintDialogOpen] =
    useState(false);
  const [isCreateCreditNoteDialogOpen, setIsCreateCreditNoteDialogOpen] =
    useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const {mutateAsync: publishInvoice} = usePublishInvoice({
    shouldNavigate: false,
  });
  const [pdfPathToDownload, setPdfPathToDownload] = useState('');

  const {data: downloadUrls} = useDownloadUrl(
    pdfPathToDownload ? [pdfPathToDownload] : [],
  );

  const {mutateAsync: deleteInvoice} = useDeleteInvoice();
  const {mutateAsync: cancelInvoice} = useCancelInvoice();

  const {isPDFsGenerated, isInvoicePDFGenerated} =
    getInvoicePDFStatuses(invoice);

  const {downloadFile} = useDownloadFileWithCustomName(
    invoice?.number,
    downloadUrls?.[pdfPathToDownload] || '',
  );

  useEffect(() => {
    if (downloadUrls?.[pdfPathToDownload]) {
      downloadFile();
      setPdfPathToDownload('');
    }
  }, [downloadUrls]);

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpenSendInvoiceModal = useCallback(() => {
    const errorMessage = validateDueDate(invoice);

    if (errorMessage) {
      enqueueSnackbar(t(errorMessage), {
        variant: 'error',
      });

      return;
    }

    setIsSendEmailDialogOpen(true);
  }, [invoice]);

  const cancelText = selectedLng === 'DE' ? 'Stornieren' : t('Cancel');
  const cancelItem = {
    label: cancelText,
    icon: <CancelIcon />,
    onClick: () => {
      setIsCancelledDialogOpen(true);
    },
  };

  const previewItem = {
    label: t('Preview'),
    icon: <RemoveRedEye />,
    onClick: () => {
      navigate(`/invoices/details/${invoice.id}`);
    },
  };

  const downloadItem = {
    label: t('Download'),
    icon: <FileDownload />,
    onClick: () => {
      setPdfPathToDownload(invoice.additionalInfo.pdfPath);
    },
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
              onClick={handleOpenSendInvoiceModal}
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

    if (invoice.status === InvoiceStatus.CANCELLED) {
      items.push(
        previewItem,
        {
          label: t('Send'),
          icon: <SendIcon />,
          onClick: () => {
            setIsSendEmailDialogOpen(true);
          },
        },
        ...(isInvoicePDFGenerated ? [downloadItem] : []),
      );
    } else if (invoice.status === InvoiceStatus.DRAFT) {
      items.push(
        previewItem,
        {
          label: t('Print'),
          icon: <Print />,
          onClick: () => setIsConfirmPrintDialogOpen(true),
        },
        {
          label: t('Edit'),
          icon: <Edit />,
          onClick: () => {
            navigate(`/invoices/details/${invoice.id}/edit`);
          },
        },
        {
          label: t('Delete'),
          icon: <DeleteIcon />,
          onClick: () => {
            setIsDeleteDialogOpen(true);
          },
        },
        ...(isInvoicePDFGenerated ? [downloadItem] : []),
      );
    } else if (invoice.status === InvoiceStatus.NOT_PAID) {
      items.push(
        {
          label: t('Preview'),
          icon: <RemoveRedEye />,
          onClick: () => {
            navigate(`/invoices/details/${invoice.id}`);
          },
        },
        {
          label: t('Payment'),
          icon: <Payments />,
          onClick: () => setIsDialogOpen(true),
        },
        {
          label: t('Create Credit note'),
          icon: <Payments />,
          onClick: () => setIsCreateCreditNoteDialogOpen(true),
        },
        ...(isInvoicePDFGenerated ? [downloadItem] : []),
        cancelItem,
      );
    } else if (invoice.status === InvoiceStatus.EXPIRED) {
      items.push(
        {
          label: t('Preview'),
          icon: <RemoveRedEye />,
          onClick: () => {
            navigate(`/invoices/details/${invoice.id}`);
          },
        },
        {
          label: t('Send Overdue Notice'),
          icon: <SendIcon />,
          onClick: () => navigate(`/invoices/${invoice.id}/overdue-notice`),
        },
        {
          label: t('Payment'),
          icon: <Payments />,
          onClick: () => setIsDialogOpen(true),
        },
        {
          label: t('Create Credit note'),
          icon: <Payments />,
          onClick: () => setIsCreateCreditNoteDialogOpen(true),
        },
        ...(isInvoicePDFGenerated ? [downloadItem] : []),
        cancelItem,
      );
    } else if (invoice.status === InvoiceStatus.PAID) {
      items.push(
        {
          label: t('Preview'),
          icon: <RemoveRedEye />,
          onClick: () => {
            navigate(`/invoices/details/${invoice.id}`);
          },
        },
        {
          label: t('Create Credit note'),
          icon: <Payments />,
          onClick: () => setIsCreateCreditNoteDialogOpen(true),
        },
        ...(isInvoicePDFGenerated ? [downloadItem] : []),
      );
    } else if (invoice.status === InvoiceStatus.PARTIALLY_PAID) {
      items.push(
        {
          label: t('Preview'),
          icon: <RemoveRedEye />,
          onClick: () => {
            navigate(`/invoices/details/${invoice.id}`);
          },
        },
        {
          label: t('Payment'),
          icon: <Payments />,
          onClick: () => setIsDialogOpen(true),
        },
        {
          label: t('Send Overdue Notice'),
          icon: <SendIcon />,
          onClick: () => navigate(`/invoices/${invoice.id}/overdue-notice`),
        },
        {
          label: t('Create Credit note'),
          icon: <Payments />,
          onClick: () => setIsCreateCreditNoteDialogOpen(true),
        },
        ...(isInvoicePDFGenerated ? [downloadItem] : []),
      );
    }

    if (invoice.sentDate && invoice.status !== InvoiceStatus.DRAFT) {
      return items.filter(
        (item) => item.label !== t('Edit') && item.label !== t('Delete'),
      );
    }

    return items;
  }, [downloadUrl, invoice.status, t]);

  const onPrintInvoice = async () => {
    const errorMessage = validateDueDate(invoice);

    if (errorMessage) {
      enqueueSnackbar(t(errorMessage), {
        variant: 'error',
      });

      return;
    }

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

  const generateEmailSubject = () => {
    const name =
      invoice.type === InvoiceType.CREDIT_NOTE
        ? invoice.serviceCompany.name
        : invoice.propertyOwner?.name;
    const type =
      invoice.type === InvoiceType.CREDIT_NOTE ? 'Credit Note' : 'Invoice';

    return t(`${name} - ${t(type)} {{invoiceNumber}}`, {
      invoiceNumber: invoice?.number ?? '',
    });
  };

  return (
    <Box>
      {isInvoiceList && action}

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
        subject={generateEmailSubject()}
        content={invoice.description}
      />

      <Confirm
        open={isDeleteDialogOpen}
        onConfirm={() => {
          if (invoice.id)
            deleteInvoice(
              {invoiceId: invoice.id, shouldNavigate: false},
              {
                onSuccess: () => {
                  enqueueSnackbar(
                    <CustomSnackbar
                      message="Invoice deleted"
                      snackIcon="delete"
                    />,
                    {
                      variant: 'info',
                      anchorOrigin: {horizontal: 'right', vertical: 'bottom'},
                    },
                  );
                },
              },
            );
          setIsDeleteDialogOpen(false);
        }}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Delete Invoice"
        content="You are about to permanently delete this invoice."
        secondContent="This action is irreversible."
        helperText="Are you sure you want to proceed?"
      />

      <Confirm
        open={isCancelledDialogOpen}
        onConfirm={() => {
          if (invoice.id)
            cancelInvoice(invoice.id, {
              onSuccess: () => {
                enqueueSnackbar(
                  <CustomSnackbar
                    message="Invoice cancelled"
                    snackIcon="cancel"
                  />,
                  {
                    variant: 'info',
                    anchorOrigin: {horizontal: 'right', vertical: 'bottom'},
                  },
                );
              },
            });

          setIsCancelledDialogOpen(false);
        }}
        onClose={() => setIsCancelledDialogOpen(false)}
        title="Cancel Invoice"
        content="You are about to cancel this invoice."
        helperText="Are you sure you want to proceed?"
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
