import {useTranslation} from 'react-i18next';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import {Alert} from '@mui/material';
import Close from '@mui/icons-material/Close';
import {createEmptyResource} from 'utils/paging-utils';
import {useQueryContractPaymentTerms} from 'hooks/reactQuery/useCompanies';
import {Button} from 'components/Button';
import {FormSelect} from './form/FormSelect';

interface Props {
  open?: boolean;
  onSave: (paymentTerms: string) => void;
  onCancel: () => void;
  title: string;
  alertText?: string;
  onClickPaymentTerms?: () => void;
}

const validationSchema = Yup.object().shape({
  paymentTerms: Yup.string().min(1).required('Payment term is required'),
});

const pageSize = 50;

export const ContractPaymentTermSelectDialog = ({
  open,
  onSave,
  onCancel,
  title,
  alertText,
  onClickPaymentTerms,
}: Props) => {
  const {t} = useTranslation();

  const formik = useFormik<{
    paymentTerms: string;
  }>({
    isInitialValid: false,
    initialValues: {
      paymentTerms: '',
    },
    onSubmit: (values, {resetForm}) => {
      onSave(values.paymentTerms);
      resetForm();
      onCancel();
    },
    validationSchema,
  });

  const {data: contractPaymentTerms = createEmptyResource(pageSize)} =
    useQueryContractPaymentTerms({
      page: {
        pageIndex: 0,
        pageSize,
      },
      query: '',
    });

  return (
    <Dialog
      open={open || false}
      onClose={onCancel}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      fullWidth
      maxWidth="sm">
      <DialogTitle
        id="alert-dialog-title"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        {title}{' '}
        <IconButton onClick={onCancel}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{pb: 5}}>
        <Alert severity="info" sx={{mb: 3, mt: 3}}>
          {alertText}
        </Alert>

        <FormSelect
          labelId="Payment Terms"
          label={t('Payment Terms')}
          options={contractPaymentTerms?.data?.map(({term}) => ({
            label: term,
            value: term,
          }))}
          selectProps={{
            id: 'paymentTerms',
            value: formik.values.paymentTerms
              ? formik.values.paymentTerms
              : undefined,
            onChange: formik.handleChange,
            name: 'paymentTerms',
            placeholder: t('Choose your payment term'),
            error: !!(
              formik.touched.paymentTerms && formik.errors.paymentTerms
            ),
          }}
          onClickPaymentTerms={onClickPaymentTerms}
        />
      </DialogContent>

      <DialogActions sx={{p: 3}}>
        <Button
          buttonProps={{
            size: 'medium',
            onClick: () => {
              formik.resetForm();
              onCancel();
            },
          }}>
          <Typography variant="subtitle2" color="text.secondary">
            {t('Cancel')}
          </Typography>
        </Button>
        <Button
          buttonProps={{
            variant: 'contained',
            size: 'medium',
            disabled: !formik.isValid,
            onClick: () => formik.handleSubmit(),
          }}>
          <Typography variant="subtitle2">{t('Save')}</Typography>
        </Button>
      </DialogActions>
    </Dialog>
  );
};
