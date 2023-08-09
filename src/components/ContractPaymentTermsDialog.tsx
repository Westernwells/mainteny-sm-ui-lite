import {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {useFormik, getIn} from 'formik';
import * as Yup from 'yup';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import {Alert} from '@mui/material';
import Add from '@mui/icons-material/Add';
import Close from '@mui/icons-material/Close';
import {getUniqueId} from 'utils/utils';
import {Button} from 'components/Button';
import {
  useCreateContractPaymentTerm,
  useDeleteContractPaymentTerm,
  useUpdateContractPaymentTerm,
} from 'hooks/reactQuery/useContractPaymentTerms';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {useQueryContractPaymentTerms} from 'hooks/reactQuery/useCompanies';
import {createEmptyResource} from 'utils/paging-utils';
import {compareArrays} from 'utils/contract-terms';
import {FormInput} from './form/FormInput';

interface Props {
  open?: boolean;
  onCancel: () => void;
  title: string;
}

const validationSchema = Yup.object().shape({
  otherPaymentTerms: Yup.array().of(
    Yup.object().shape({
      id: Yup.string(),
      term: Yup.string().min(1).required('Payment term is required'),
    }),
  ),
});

const pageSize = 50;

export const ContractPaymentTermsDialog = ({open, onCancel, title}: Props) => {
  const {t} = useTranslation();
  const {user} = useUserSession();
  const {mutate: createContractPaymentTerm} = useCreateContractPaymentTerm();
  const {mutateAsync: updateContractPaymentTerm} =
    useUpdateContractPaymentTerm();
  const {mutate: deleteContractPaymentTerm} = useDeleteContractPaymentTerm();

  const {data: contractPaymentTerms = createEmptyResource(pageSize)} =
    useQueryContractPaymentTerms({
      page: {
        pageIndex: 0,
        pageSize,
      },
      query: '',
    });

  const formik = useFormik<{
    otherPaymentTerms: {id: string; term: string}[];
  }>({
    isInitialValid: false,
    initialValues: {
      otherPaymentTerms: [],
    },
    onSubmit: (values, {resetForm}) => {
      const comparisonResult = compareArrays(
        contractPaymentTerms.data,
        values.otherPaymentTerms,
      );

      if (comparisonResult.itemsInFirstOnly) {
        comparisonResult.itemsInFirstOnly.forEach(
          (pt) =>
            pt.id &&
            deleteContractPaymentTerm({
              paymentTermId: pt.id,
            }),
        );
      }

      if (comparisonResult.modifiedItems) {
        comparisonResult.modifiedItems.forEach(
          (pt) =>
            pt.id &&
            updateContractPaymentTerm({
              body: {
                term: pt.term,
              },
              paymentTermId: pt.id,
            }),
        );
      }

      if (comparisonResult.newItems) {
        comparisonResult.newItems.forEach(
          (pt) =>
            pt.term &&
            createContractPaymentTerm({
              serviceCompanyId: user!.userAccount.serviceCompany.id,
              term: pt.term,
            }),
        );
      }
      resetForm();
      onCancel();
    },
    validationSchema,
  });

  const addNewTerm = () => {
    formik.setFieldValue('otherPaymentTerms', [
      ...formik.values.otherPaymentTerms,
      {
        id: getUniqueId(),
        term: '',
      },
    ]);
  };

  const removeTerm = (id: string) => {
    formik.setFieldValue(
      'otherPaymentTerms',
      formik.values.otherPaymentTerms.filter((pt) => pt.id !== id),
    );
  };

  useEffect(() => {
    if (open) {
      if (contractPaymentTerms.data.length) {
        formik.setFieldValue('otherPaymentTerms', [
          ...contractPaymentTerms.data,
        ]);
      } else {
        formik.setFieldValue('otherPaymentTerms', [
          {
            id: getUniqueId(),
            term: '',
          },
        ]);
      }
    }
  }, [open]);

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

      <DialogContent sx={{pb: 1}}>
        <Alert severity="warning" sx={{mt: '1em', mb: '1em', py: '1em'}}>
          <Typography
            sx={{
              fontWeight: '600',
              marginTop: '-0.3em',
              marginBottom: '0.3em',
            }}>
            {t('Payment terms used')} <br />
          </Typography>

          <Typography
            sx={{
              lineHeight: '1.4',
              fontSize: '1em',
              letterSpacing: '0.02em',
            }}>
            {t('This payment term is linked to one or more contracts.')}
            <br />
            {t('Remove it from all contracts before deleting here.')}
          </Typography>
        </Alert>

        <Grid container rowSpacing={2} pt={1} pb={2}>
          {formik.values.otherPaymentTerms.map?.((pt, index) => (
            <Grid
              container
              item
              xs={12}
              key={pt.id}
              sx={{alignItems: 'flex-start'}}>
              <Grid item xs={11}>
                <FormInput
                  props={{
                    name: `otherPaymentTerms[${index}].term`,
                    placeholder: t('Write your term here'),
                    variant: 'outlined',
                    type: 'text',
                    value: formik.values.otherPaymentTerms[index].term,
                    error: !!(
                      getIn(formik.touched, `otherPaymentTerms[${index}]`) &&
                      getIn(formik.errors, `otherPaymentTerms[${index}]`)
                    ),
                    helperText:
                      formik.errors.otherPaymentTerms &&
                      formik.touched.otherPaymentTerms
                        ? getIn(
                            formik.errors,
                            `otherPaymentTerms[${index}].term`,
                          )
                        : '',
                    onBlur: formik.handleBlur,
                    onChange: formik.handleChange,
                    required: true,
                    sx: {
                      bgcolor: 'white',
                    },
                  }}
                />
              </Grid>
              <Grid container item xs={1} justifyContent="center">
                <IconButton onClick={() => removeTerm(pt.id)}>
                  <Close />
                </IconButton>
              </Grid>
            </Grid>
          ))}
        </Grid>

        <Button
          buttonProps={{
            size: 'medium',
            variant: 'text',
            onClick: addNewTerm,
            startIcon: <Add />,
          }}>
          <Typography variant="subtitle2" sx={{pt: 2, pb: 2}}>
            {t('New Payment Term')}
          </Typography>
        </Button>
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
            disabled:
              !formik.isValid && !!formik.values.otherPaymentTerms.length,
            onClick: () => formik.handleSubmit(),
          }}>
          <Typography variant="subtitle2">{t('Save')}</Typography>
        </Button>
      </DialogActions>
    </Dialog>
  );
};
