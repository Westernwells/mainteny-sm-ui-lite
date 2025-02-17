import {Dialog} from 'components/Dialog';
import {Button} from 'components/Button';
import Typography from '@mui/material/Typography';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import useTheme from '@mui/material/styles/useTheme';
import {
  PurchaseInvoiceStatus,
  UpdatePurchaseInvoiceRecord,
} from 'models/purchaseInvoice';
import {
  usePurchaseInvoiceDetail,
  useUpdatePurchaseInvoice,
} from 'hooks/reactQuery/usePurchaseInvoice';
import {QUICK_FILTER_OPTIONS} from '.';

type Props = {
  open: boolean;
  id: string;
  onClose: () => void;
};

const ChangePurchaseInvoiceStatusDialog = ({open, id, onClose}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();

  const {data: purchaseInvoiceDetail} = usePurchaseInvoiceDetail(id, {
    enabled: open,
  });

  const {mutateAsync: updatePurchaseInvoiceAsync} = useUpdatePurchaseInvoice();

  const [selectedStatus, setSelectedStatus] = useState<PurchaseInvoiceStatus>();

  const handleChange = (e: SelectChangeEvent<PurchaseInvoiceStatus>) => {
    setSelectedStatus(e.target.value as PurchaseInvoiceStatus);
  };

  const handleConfirm = async () => {
    const values: UpdatePurchaseInvoiceRecord = {
      externalId: purchaseInvoiceDetail?.externalId || '',
      subject: purchaseInvoiceDetail?.subject || '',
      description: purchaseInvoiceDetail?.description || '',
      supplier: purchaseInvoiceDetail?.additionalInfo.supplier!,
      dueDate: purchaseInvoiceDetail?.dueDate || '',
      sentDate: purchaseInvoiceDetail?.sentDate || '',
      currency: purchaseInvoiceDetail?.totalAmount.currency || '',
      serviceOrders: purchaseInvoiceDetail?.additionalInfo.serviceOrders
        ? purchaseInvoiceDetail.additionalInfo.serviceOrders.map(
            (serviceOrder) => ({
              serviceOrderId: serviceOrder.serviceOrder.id!,
              netAmount: serviceOrder.netAmount!,
            }),
          )
        : [],
      vats: purchaseInvoiceDetail?.totalAmount.vats!,
      discount: purchaseInvoiceDetail?.additionalInfo.discount!,
      documents: purchaseInvoiceDetail?.additionalInfo.documents!,
      status: selectedStatus!,
    };

    updatePurchaseInvoiceAsync({
      data: {...values},
      invoiceId: purchaseInvoiceDetail?.id!,
    });

    onClose();
  };

  return (
    <Dialog
      title="Change status"
      dialogProps={{
        maxWidth: 'sm',
        open,
      }}
      leftButton={
        <Button
          testId="saveButton"
          buttonProps={{
            size: 'large',
            onClick: onClose,
          }}>
          <Typography variant="subtitle2">{t('Cancel')}</Typography>
        </Button>
      }
      renderRightFooterButton={() => (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: theme.spacing(1.5),
          }}>
          <Button
            testId="saveButton"
            buttonProps={{
              size: 'large',
              onClick: handleConfirm,
              color: 'primary',
              variant: 'contained',
            }}>
            <Typography variant="subtitle2">{t('Save')}</Typography>
          </Button>
        </Box>
      )}
      onCancel={onClose}
      showCancelButton={false}>
      <Box sx={{display: 'flex', flexDirection: 'column'}}>
        <Typography pb={3}>
          {t(
            'You are about to change status of invoice {{invoiceNumber}}. Pick a new status to change into.',
            {invoiceNumber: purchaseInvoiceDetail?.externalId},
          )}
        </Typography>
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">{t('Status')}</InputLabel>
          <Select
            labelId="purchase-invoice-status-select-label"
            id="purchase-invoice-status-select"
            data-testid="purchase-invoice-status-select"
            value={selectedStatus}
            fullWidth
            label={t('Status')}
            onChange={handleChange}>
            {QUICK_FILTER_OPTIONS.filter(
              (option) => option.value !== PurchaseInvoiceStatus.ALL,
            ).map((option) => (
              <MenuItem
                key={`purchase-invoice-select-option-${option.value}`}
                value={option.value}>
                {t(option.labelKey)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Dialog>
  );
};

export default ChangePurchaseInvoiceStatusDialog;
