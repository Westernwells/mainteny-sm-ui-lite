import Dialog from '@mui/material/Dialog';
import {useTranslation} from 'react-i18next';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {SimpleEmailRecord} from 'models/misc';
import {usePublishInvoice} from 'hooks/reactQuery/useInvoice';
import {Button} from 'components/Button';
import {FormInput} from 'components/form/FormInput';
import {usePublishQuotation} from 'hooks/reactQuery/useQuotation';

interface Props {
  open: boolean;
  onConfirm: () => void;
  onClose: () => void;
  submitHook: typeof usePublishInvoice | typeof usePublishQuotation;
  id: string;
}

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Enter a valid email')
    .required('Email is required'),
  subject: Yup.string().required('Subject is required'),
  content: Yup.string().required('Content is required'),
});

export const SendEmailDialog = ({
  open,
  onConfirm,
  onClose,
  submitHook,
  id,
}: Props) => {
  const {t} = useTranslation();
  const {mutate: publish} = submitHook();
  const formik = useFormik<SimpleEmailRecord>({
    initialValues: {
      email: '',
      subject: '',
      content: '',
    },
    onSubmit: (values, {setSubmitting}) => {
      publish(
        {
          id,
          body: {
            email: values.email,
            subject: values.subject,
            content: values.content,
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
      maxWidth="sm"
      PaperProps={{
        sx: {
          padding: '1.5rem',
        },
      }}>
      <DialogTitle id="alert-dialog-title" sx={{padding: 0}}>
        {t('Send email')}
      </DialogTitle>
      <DialogContent sx={{p: 0, px: 0, pb: '1.5rem'}}>
        <Box display="flex" flexDirection="column" gap={3} pt="2rem">
          <FormInput
            props={{
              size: 'small',
              placeholder: 'e.g johndoe@example.com',
              label: 'Email Address',
              name: 'email',
              required: true,
              helperText: formik.touched.email && formik.errors.email,
              error: !!formik.errors.email && formik.touched.email,
              value: formik.values.email,
              onChange: formik.handleChange,
            }}
          />
          <FormInput
            props={{
              size: 'small',
              label: 'Subject',
              name: 'subject',
              required: true,
              helperText: formik.touched.subject && formik.errors.subject,
              error: !!formik.errors.subject && formik.touched.subject,
              value: formik.values.subject,
              onChange: formik.handleChange,
            }}
          />
          <FormInput
            props={{
              label: 'Text',
              size: 'small',
              name: 'content',
              required: true,
              helperText: formik.touched.content && formik.errors.content,
              error: !!formik.errors.content && formik.touched.content,
              value: formik.values.content,
              onChange: formik.handleChange,
              multiline: true,
              minRows: 5,
              maxRows: 5,
              onKeyDown: (e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  formik.handleSubmit();
                }
              },
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{padding: 0, justifyContent: 'space-between'}}>
        <Button
          buttonProps={{
            size: 'medium',
            variant: 'outlined',
            sx: {
              color: 'text.secondary',
              background: 'transparent',
            },
            onClick: onClose,
          }}>
          <Typography variant="subtitle2">{t('Cancel')}</Typography>
        </Button>

        <Button
          buttonProps={{
            size: 'medium',
            variant: 'contained',
            autoFocus: true,
            disabled: formik.isSubmitting,
            onClick: () => formik.handleSubmit(),
          }}>
          <Typography variant="subtitle2">{t('Send email')}</Typography>
        </Button>
      </DialogActions>
    </Dialog>
  );
};
