import {SyntheticEvent, useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import * as _ from 'lodash';
import {useFormik, getIn} from 'formik';
import * as Yup from 'yup';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Add from '@mui/icons-material/Add';
import Close from '@mui/icons-material/Close';
import {createEmptyResource} from 'utils/paging-utils';
import {getUniqueId} from 'utils/utils';
import {Button} from 'components/Button';
import {useQueryContractPaymentTerms} from 'hooks/reactQuery/useCompanies';
import {useCreateContractPaymentTerm} from 'hooks/reactQuery/useContractPaymentTerms';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {ContractPaymentTermView} from 'models/contract';
import {Resource} from 'models/misc';
import {FormInput} from './form/FormInput';

interface Props {
  open?: boolean;
  onSave: (paymentTerms: string) => void;
  onCancel: () => void;
  title: string;
  paymentTerms?: string;
}

const validationSchema = Yup.object().shape({
  paymentTerms: Yup.string().min(1).required('Payment term is required'),
  otherPaymentTerms: Yup.array().of(
    Yup.object().shape({
      id: Yup.string(),
      term: Yup.string(),
    }),
  ),
});

const pageSize = 50;

export const ContractPaymentTermsDialog = ({
  open,
  onSave,
  onCancel,
  title,
  paymentTerms,
}: Props) => {
  const {t} = useTranslation();
  const [query, setQuery] = useState<string>('');
  const [queryView, setQueryView] = useState('');
  const {user} = useUserSession();
  const {mutate: createContractPaymentTerm} = useCreateContractPaymentTerm();

  const formik = useFormik<{
    paymentTerms: string;
    otherPaymentTerms: {id: string; term: string}[];
  }>({
    isInitialValid: false,
    initialValues: {
      paymentTerms: '',
      otherPaymentTerms: [],
    },
    onSubmit: (values, {resetForm}) => {
      onSave(values.paymentTerms);
      values.otherPaymentTerms.forEach(
        (pt) =>
          pt.term &&
          createContractPaymentTerm({
            serviceCompanyId: user!.userAccount.serviceCompany.id,
            term: pt.term,
          }),
      );
      resetForm();
    },
    validationSchema,
  });

  const [contractPaymentTermsData, setContractPaymentTermsData] = useState<
    ContractPaymentTermView[]
  >([]);

  const setContractPaymentTermsDataHandler = (
    newlyAddedPaymentTerms: {id: string; term: string}[],
    apiData: ContractPaymentTermView[],
  ) => {
    setContractPaymentTermsData([
      ...(newlyAddedPaymentTerms as ContractPaymentTermView[]),
      ...apiData,
    ]);
  };

  const {data: contractPaymentTerms = createEmptyResource(pageSize)} =
    useQueryContractPaymentTerms({
      page: {
        pageIndex: 0,
        pageSize,
      },
      query: encodeURIComponent(query),
      options: {
        onSuccess: (resp: Resource<ContractPaymentTermView>) =>
          setContractPaymentTermsDataHandler(
            formik.values.otherPaymentTerms,
            resp.data,
          ),
      },
    });

  useEffect(() => {
    if (paymentTerms) {
      formik.setFieldValue('paymentTerms', paymentTerms);
      setQueryView(paymentTerms);
    }
  }, [paymentTerms]);

  useEffect(() => {
    setContractPaymentTermsDataHandler(
      formik.values.otherPaymentTerms,
      contractPaymentTerms.data,
    );
  }, [formik.values.otherPaymentTerms]);

  const debouncedChangeHandler = useCallback(
    _.debounce((newValue: string) => {
      setQuery(newValue);
    }, 1),
    [],
  );

  const onInputChange = (_e: SyntheticEvent, newValue: string) => {
    setQueryView(newValue);
    debouncedChangeHandler(newValue);
  };

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

  return (
    <Dialog
      open={open || false}
      onClose={onCancel}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description">
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent sx={{pb: 1}}>
        <Autocomplete
          size="small"
          clearOnBlur={false}
          id="paymentTerms"
          noOptionsText="No terms found. Add other terms first to be used here."
          sx={{minWidth: 500, mt: '0.5em'}}
          options={contractPaymentTermsData}
          onChange={(_event: any, newValue: ContractPaymentTermView | null) =>
            formik.setFieldValue('paymentTerms', newValue?.term ?? '')
          }
          getOptionLabel={(option) => option.term}
          onInputChange={onInputChange}
          inputValue={queryView}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t('Payment terms')}
              placeholder={t('Choose your payment term')}
              name="paymentTerms"
              error={!!formik.errors.paymentTerms}
              onChange={formik.handleChange}
              required
            />
          )}
        />

        <Box pt={3}>
          <Typography variant="overline" textTransform="uppercase">
            {t('Add other terms')}
          </Typography>
        </Box>

        <Grid container rowSpacing={2} pt={1} pb={2}>
          {formik.values.otherPaymentTerms.map?.((pt, index) => (
            <Grid container item xs={12} key={pt.id}>
              <Grid item xs={11}>
                <FormInput
                  props={{
                    name: `otherPaymentTerms[${index}].term`,
                    variant: 'outlined',
                    value: formik.values.otherPaymentTerms[index].term,
                    error: !!(
                      getIn(formik.touched, `otherPaymentTerms[${index}]`) &&
                      getIn(formik.errors, `otherPaymentTerms[${index}]`)
                    ),
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
          <Typography variant="subtitle2">{t('New Term')}</Typography>
        </Button>
      </DialogContent>

      <DialogActions sx={{p: 3}}>
        <Button
          buttonProps={{
            size: 'medium',
            onClick: () => {
              formik.resetForm();
              setQueryView('');
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
