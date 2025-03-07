import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {useTranslation} from 'react-i18next';
import {Button} from 'components/Button';
import {CompleteServiceOrder, ServiceOrderView} from 'models/service-order';
import {FormInput} from 'components/form/FormInput';
import {useCompleteServiceOrder} from 'hooks/reactQuery/useServiceOrder';
import {removeHtmlTags} from 'utils/rich-field-string';

interface Props {
  open?: boolean;
  onClose: () => void;
  title: string;
  serviceOrderDetails: ServiceOrderView;
}

const validationSchema = Yup.object().shape({
  serviceTime: Yup.number().min(1).nullable().required('Duration is required'),
  description: Yup.string().nullable(),
  externalId: Yup.string().nullable(),
});

export const MarkCompletedDialog = ({
  open,
  onClose,
  title,
  serviceOrderDetails,
}: Props) => {
  const {t} = useTranslation();
  const {mutate: completeServiceOrder} = useCompleteServiceOrder(
    'Service job completed',
  );
  const formik = useFormik<CompleteServiceOrder>({
    initialValues: {
      serviceTime:
        typeof serviceOrderDetails?.serviceTime !== 'undefined' &&
        serviceOrderDetails.serviceTime > 0
          ? serviceOrderDetails.serviceTime
          : 1,
      description: removeHtmlTags(serviceOrderDetails?.description),
    },
    onSubmit: async (values: CompleteServiceOrder) => {
      await completeServiceOrder({
        serviceOrderId: serviceOrderDetails.id,
        body: values,
      });
      onClose();
    },
    validationSchema,
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Dialog
        open={open || false}
        onClose={onClose}
        fullWidth
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" component="div">
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <FormInput
                  fieldProps={{
                    type: 'number',
                    label: t('Duration (in minutes)'),
                    name: 'serviceTime',
                    value: formik.values.serviceTime,
                    onBlur: formik.handleBlur,
                    error: !!(
                      formik.touched.serviceTime && formik.errors.serviceTime
                    ),
                    helperText:
                      formik.touched.serviceTime && formik.errors.serviceTime
                        ? formik.errors.serviceTime
                        : '',
                    onChange: formik.handleChange,
                    required: true,
                    margin: 'dense',
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <FormInput
                  fieldProps={{
                    label: t('Description'),
                    name: 'description',
                    value: formik.values.description,
                    onBlur: formik.handleBlur,
                    error: !!(
                      formik.touched.description && formik.errors.description
                    ),
                    helperText:
                      formik.touched.description && formik.errors.description
                        ? formik.errors.description
                        : '',
                    onChange: formik.handleChange,
                    multiline: true,
                    minRows: 5,
                  }}
                />
              </Grid>
            </Grid>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{mt: '1rem'}}>
          <Button
            buttonProps={{
              onClick: onClose,
            }}>
            <Typography variant="subtitle2" color="text.secondary">
              {t('No')}
            </Typography>
          </Button>
          <Button
            buttonProps={{
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              onClick: () => formik.handleSubmit(),
              autoFocus: true,
              disabled: !formik.isValid,
            }}>
            <Typography variant="subtitle2">{t('Yes')}</Typography>
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
