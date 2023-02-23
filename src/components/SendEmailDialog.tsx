import Dialog from '@mui/material/Dialog';
import {useTranslation} from 'react-i18next';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import CachedIcon from '@mui/icons-material/Cached';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import {SimpleEmailRecord} from 'models/misc';
import {usePublishInvoice} from 'hooks/reactQuery/useInvoice';
import {Button} from 'components/Button';
import {FormInput} from 'components/form/FormInput';
import {usePublishQuotation} from 'hooks/reactQuery/useQuotation';

interface Props {
  open: boolean;
  onConfirm?: () => void;
  onClose: () => void;
  submitHook?: typeof usePublishInvoice | typeof usePublishQuotation;
  id?: string;
  confirmBtnDisabled?: boolean;
  email?: string;
  subject?: string;
  content?: string;
  callback?: ({email, subject, content}: SimpleEmailRecord) => void;
  loadingProgress?: number;
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
  confirmBtnDisabled,
  email,
  subject,
  content,
  callback,
  loadingProgress,
}: Props) => {
  const {t} = useTranslation();
  const publish = submitHook?.();
  const formik = useFormik<SimpleEmailRecord>({
    initialValues: {
      email: email || '',
      subject: subject || '',
      content: content || '',
    },
    onSubmit: async (values, {setSubmitting}) => {
      const contentWithLineBreaks = values.content.replace(/\n/g, '<br/>');
      if (submitHook && publish && id) {
        publish.mutate(
          {
            id,
            body: {
              email: values.email,
              subject: values.subject,
              content: contentWithLineBreaks,
            },
          },
          {
            onSuccess: () => {
              formik.resetForm();
              if (onConfirm) {
                onConfirm();
              }
            },
            onSettled: () => setSubmitting(false),
          },
        );
      } else if (callback) {
        callback({...values, content: contentWithLineBreaks});
      }
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
            }}
          />
        </Box>
        {loadingProgress && loadingProgress > 0 ? (
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            pt={2}>
            <Typography variant="caption">
              {loadingProgress <= 99
                ? t('Your PDF is being generated')
                : t('Your PDF has been generated successfully!')}
            </Typography>
            <Typography
              variant="caption"
              component="div"
              display="flex"
              alignItems="center">
              {loadingProgress}%
              {loadingProgress <= 99 ? (
                <CachedIcon
                  sx={{color: 'text.secondary', ml: 1}}
                  fontSize="small"
                />
              ) : (
                <CheckCircleRounded
                  color="success"
                  sx={{ml: 1}}
                  fontSize="small"
                />
              )}
            </Typography>
          </Box>
        ) : null}
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
        <Tooltip
          open={confirmBtnDisabled}
          title={
            confirmBtnDisabled
              ? t('The PDFs are not generated yet.')
              : t('Send')
          }
          placement="left"
          arrow>
          <span>
            <Button
              buttonProps={{
                size: 'medium',
                variant: 'contained',
                autoFocus: true,
                disabled:
                  formik.isSubmitting ||
                  confirmBtnDisabled ||
                  Object.keys(formik.errors).length > 0,
                onClick: () => formik.handleSubmit(),
              }}>
              <Typography variant="subtitle2">{t('Send email')}</Typography>
            </Button>
          </span>
        </Tooltip>
      </DialogActions>
    </Dialog>
  );
};
