import Dialog from '@mui/material/Dialog';
import {useTranslation} from 'react-i18next';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import useTheme from '@mui/material/styles/useTheme';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import {InvoicePaymentRecord, InvoiceView} from 'models/invoice';
import {useAddInvoicePayment} from 'hooks/reactQuery/useInvoice';
import {formatDate} from 'utils/datetime';
import {getCurrencySymbol} from 'utils/currency';
import {FormInput} from 'components/form/FormInput';
import {Button} from 'components/Button';
import {DatePicker} from 'components/DatePicker';
import {FormCheckbox} from 'components/form/FormCheckbox';

interface Props {
  open?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  invoice: InvoiceView;
}

const validationSchema = Yup.object().shape({
  amount: Yup.object().shape({
    value: Yup.number().required('Amount is required'),
  }),
  paidDate: Yup.string().required('Date is required'),
});

export const MarkAsPaidDialog = ({
  open,
  onConfirm,
  onClose,
  invoice,
}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const {mutate: addInvoicePayment} = useAddInvoicePayment();
  const formik = useFormik<InvoicePaymentRecord & {paidInFull: boolean}>({
    initialValues: {
      amount: {
        value:
          invoice.totalAmount.netAmount /
          10 ** invoice.totalAmount.fractionDigits!,
        currency: invoice.totalAmount.currency,
      },
      paidDate: new Date().toString(),
      markAsPaid: true,
      paidInFull: true,
    },
    onSubmit: (values, {setSubmitting}) => {
      addInvoicePayment(
        {
          invoiceId: invoice.id,
          body: {
            amount: {
              value:
                values.amount.value * 10 ** invoice.totalAmount.fractionDigits!,
              currency: values.amount.currency,
            },
            paidDate: formatDate(values.paidDate, 'yyyy-MM-dd')!,
            markAsPaid: values.markAsPaid,
          },
        },
        {
          onSuccess: () => {
            formik.resetForm();
            onConfirm();
          },
          onSettled: () => setSubmitting(false),
        },
      );
    },
    validationSchema,
  });

  return (
    <Dialog
      open={open || false}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          p: '1.5rem',
        },
      }}>
      <DialogTitle id="alert-dialog-title" sx={{px: 0, pt: 0}}>
        {t('Payment')}
      </DialogTitle>
      <DialogContent sx={{p: 0, pb: '0.5rem'}}>
        <DialogContentText
          id="alert-dialog-description"
          sx={{color: 'text.primary'}}
          component="div">
          <Typography>
            {t('Do you want to mark this invoice as paid?')}
          </Typography>
          <Typography variant="subtitle2">
            {t('This action is irreversible.')}
          </Typography>
        </DialogContentText>
        <Box display="flex" flexDirection="column" gap={1} pt="2rem">
          <FormInput
            props={{
              placeholder: 'e.g. 200',
              label: 'Paid amount',
              name: 'amount.value',
              id: 'amount.value',
              value: formik.values.amount.value,
              onBlur: formik.handleBlur,
              onChange: formik.handleChange,
              error: !!(
                formik.touched.amount?.value && formik.errors.amount?.value
              ),
              helperText:
                formik.touched.amount?.value && formik.errors.amount?.value
                  ? formik.errors.amount.value
                  : '',
              required: true,
              type: 'number',
              disabled: formik.values.paidInFull,
              InputProps: {
                endAdornment: (
                  <InputAdornment position="start">
                    {getCurrencySymbol[invoice.totalAmount.currency]}
                  </InputAdornment>
                ),
              },
            }}
          />
          <FormCheckbox
            checked={formik.values.paidInFull}
            name="paidInFull"
            handleChange={formik.handleChange}
            label={t('Paid in full')}
          />
          <DatePicker
            defaultDate={new Date()}
            getSelectedDate={(newValue) => {
              if (newValue) formik.setFieldValue('paidDate', newValue);
            }}
            textFieldProps={{
              label: t('Date'),
              name: 'paidDate',
              helperText:
                formik.errors.paidDate && formik.touched.paidDate
                  ? formik.errors.paidDate
                  : '',
              error: !!(formik.touched.paidDate && formik.errors.paidDate),
              onBlur: formik.handleBlur,
            }}
            containerStyles={{mb: '1.5em'}}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          buttonProps={{
            size: 'medium',
            variant: 'text',
            sx: {
              mr: '1rem',
            },
            onClick: onClose,
          }}>
          <Typography variant="subtitle2" color={theme.palette.primary.main}>
            {t('Keep as Unpaid')}
          </Typography>
        </Button>

        <Button
          buttonProps={{
            size: 'medium',
            variant: 'contained',
            autoFocus: true,
            disabled: formik.isSubmitting,
            onClick: () => formik.handleSubmit(),
          }}>
          <Typography variant="subtitle2">{t('Mark as paid')}</Typography>
        </Button>
      </DialogActions>
    </Dialog>
  );
};
