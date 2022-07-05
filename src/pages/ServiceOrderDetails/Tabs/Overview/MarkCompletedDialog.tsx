import React, {useMemo} from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import {grey} from '@mui/material/colors';
import useTheme from '@mui/material/styles/useTheme';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {groupBy, sortBy} from 'lodash';
import {useTranslation} from 'react-i18next';
import {Button} from 'components/Button';
import {CompleteServiceOrder, ServiceOrderView} from 'models/service-order';
import {FormInput} from 'components/form/FormInput';
import {FormCheckbox} from 'components/form/FormCheckbox';
import {useCompleteServiceOrder} from 'hooks/reactQuery/useServiceOrder';

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
  answers: Yup.array().nullable(),
});

export const MarkCompletedDialog = ({
  open,
  onClose,
  title,
  serviceOrderDetails,
}: Props) => {
  const theme = useTheme();
  const {t} = useTranslation();
  const {mutate: completeServiceOrder} = useCompleteServiceOrder();
  const formik = useFormik<CompleteServiceOrder>({
    initialValues: {
      serviceTime:
        typeof serviceOrderDetails?.serviceTime !== 'undefined' &&
        serviceOrderDetails.serviceTime > 0
          ? serviceOrderDetails.serviceTime
          : 1,
      description: serviceOrderDetails?.description,
      externalId: serviceOrderDetails?.externalId,
      answers: [],
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

  const questions = useMemo(() => {
    const groupedByCategories = groupBy(
      serviceOrderDetails.additionalInfo.checkList?.questions,
      'category',
    );

    return {
      byCategories: sortBy(Object.keys(groupedByCategories)).map(
        (category) => ({
          category,
          questions: groupedByCategories[category],
        }),
      ),
    };
  }, [serviceOrderDetails]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {checked, value} = e.target;
    if (checked) {
      const checklistQuestion =
        serviceOrderDetails?.additionalInfo?.checkList?.questions?.find(
          (question) => question.id === value,
        )?.question;
      formik.setFieldValue('answers', [
        ...formik.values.answers,
        {
          questionId: value,
          answer: checklistQuestion || '',
        },
      ]);
    } else {
      formik.setFieldValue(
        'answers',
        formik.values.answers.filter((v) => v.questionId !== value),
      );
    }
  };

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
                  props={{
                    type: 'number',
                    label: 'Duration (in minutes)',
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
                  props={{
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

              {serviceOrderDetails.additionalInfo.checkList?.questions && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" color={grey[700]}>
                    Routine Maintenance Checklist
                  </Typography>
                  <Box pt="0.5rem">
                    {questions.byCategories.map((category) => (
                      <Box py="0.5rem" key={category.category}>
                        <Typography
                          variant="subtitle2"
                          color={theme.palette.text.primary}>
                          {category.category}:
                        </Typography>
                        <Grid container pt="0.25rem">
                          {category.questions.map((question) => (
                            <Grid item xs={12} key={question.id}>
                              <FormCheckbox
                                checked={
                                  !!formik.values?.answers?.find(
                                    (a) => a.questionId === question.id,
                                  )
                                }
                                checkboxProps={{
                                  size: 'small',
                                }}
                                value={question.id}
                                id={question.id}
                                handleChange={handleChange}
                                label={question.question}
                                typographyProps={{
                                  py: '0.5rem',
                                  color: theme.palette.text.primary,
                                  variant: 'body2',
                                }}
                                sx={{alignItems: 'flex-start'}}
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    ))}
                  </Box>
                </Grid>
              )}
            </Grid>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{mt: '1rem'}}>
          <Button
            buttonProps={{
              onClick: onClose,
            }}>
            <Typography variant="subtitle2" color="text.secondary">
              No
            </Typography>
          </Button>
          <Button
            buttonProps={{
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              onClick: (_e) => formik.handleSubmit(),
              autoFocus: true,
              disabled: !formik.isValid,
            }}>
            <Typography variant="subtitle2">Yes</Typography>
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
