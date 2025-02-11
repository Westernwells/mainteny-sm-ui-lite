import Dialog from '@mui/material/Dialog';
import {useTranslation} from 'react-i18next';
import {useFormik} from 'formik';
import * as Yup from 'yup';
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
import {getBalanceAmount} from 'utils/invoice';
import {useMemo} from 'react';

interface Props {
  open?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  invoice: InvoiceView;
  disableNavigate?: boolean;
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
  disableNavigate = false,
}: Props) => {
  const {t} = useTranslation();
  const {mutateAsync: addInvoicePayment} =
    useAddInvoicePayment(disableNavigate);

  const initialValues = useMemo<InvoicePaymentRecord>(
    () => ({
      amount: {
        value: getBalanceAmount(invoice),
        currency: invoice.totalAmount.currency,
      },
      paidDate: formatDate(new Date(), 'yyyy-MM-dd')!,
      markAsPaid: false,
    }),
    [invoice],
  );

  const formik = useFormik<InvoicePaymentRecord>({
    enableReinitialize: true,
    initialValues,
    onSubmit: async (values, {setSubmitting}) => {
      await addInvoicePayment(
        {
          invoiceId: invoice.id,
          body: {
            amount: {
              value:
                (values.amount?.value ?? 0) *
                10 ** invoice.totalAmount.fractionDigits!,
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
          onSettled: () => {
            setSubmitting(false);
          },
        },
      );
    },
    validationSchema,
  });

  return (
    <Dialog
      open={open || false}
      onClose={() => {
        formik.resetForm();
        onClose();
      }}
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
            inputType="currency"
            onValueChange={(values) => {
              formik.setFieldValue(values.name as string, values.value);
            }}
            fieldProps={{
              placeholder: 'e.g. 200',
              label: t('Paid amount (incl. VAT)'),
              name: 'amount.value',
              id: 'amount.value',
              value: formik.values.amount.value,
              onBlur: formik.handleBlur,
              error: !!(
                formik.touched.amount?.value && formik.errors.amount?.value
              ),
              helperText:
                formik.touched.amount?.value && formik.errors.amount?.value
                  ? formik.errors.amount.value
                  : '',
              required: true,
              type: 'number',
              disabled: formik.values.markAsPaid,
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
            checked={formik.values.markAsPaid}
            name="markAsPaid"
            handleChange={formik.handleChange}
            label={t('Mark as paid')}
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
            onClick: () => onClose(),
            sx: {
              textTransform: 'capitalize',
            },
          }}>
          <Typography variant="subtitle2">{t('Cancel')}</Typography>
        </Button>
        <Button
          buttonProps={{
            size: 'medium',
            variant: 'contained',
            autoFocus: true,
            disabled: formik.isSubmitting,
            onClick: () => {
              formik.handleSubmit();
            },
            sx: {
              textTransform: 'capitalize',
            },
          }}>
          <Typography variant="subtitle2">{t('Okay')}</Typography>
        </Button>
      </DialogActions>
    </Dialog>
  );
};
