import {useTranslation} from 'react-i18next';
import {useFormik} from 'formik';
import {ReactComponent as LeftRightArrow} from 'assets/icons/LeftRightArrow.svg';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import {Drawer, Box, InputAdornment} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import {createEmptyResource} from 'utils/paging-utils';
import {useQueryContractPaymentTerms} from 'hooks/reactQuery/useCompanies';
import {Button} from 'components/Button';
import {Dispatch, SetStateAction} from 'react';
import {Button as LoadingButton} from 'components/LoadingButton';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {getUniqueId} from 'utils/utils';
import {compareArrays} from 'utils/contract-terms';
import {ContractPaymentTermView} from 'models/contract';
import {
  useCreateContractPaymentTerm,
  useUpdateContractPaymentTerm,
} from 'hooks/reactQuery/useContractPaymentTerms';
import {FormInput} from './form/FormInput';

interface Props {
  open?: boolean;
  onCancel: () => void;
  title: string;
  defaultPaymentTerm?: ContractPaymentTermView;
  setPaymentToEdit: Dispatch<
    SetStateAction<ContractPaymentTermView | undefined>
  >;
}

const pageSize = 50;

export const InvoiceContractPaymentTermInput = ({
  open,
  onCancel,
  title,
  defaultPaymentTerm,
  setPaymentToEdit,
}: Props) => {
  const {t} = useTranslation();
  const {user} = useUserSession();
  const {mutateAsync: createContractPaymentTerm, isLoading: createLoading} =
    useCreateContractPaymentTerm();
  const {mutateAsync: updateContractPaymentTerm, isLoading: updateLoading} =
    useUpdateContractPaymentTerm();
  const {data: contractPaymentTerms = createEmptyResource(pageSize)} =
    useQueryContractPaymentTerms({
      page: {
        pageIndex: 0,
        pageSize,
      },
      query: '',
    });

  const formik = useFormik<{
    otherPaymentTerm: {id: string; term: string};
  }>({
    initialValues: {
      otherPaymentTerm: {
        id: defaultPaymentTerm ? defaultPaymentTerm.id : getUniqueId(),
        term: defaultPaymentTerm ? defaultPaymentTerm.term : '',
      },
    },
    onSubmit: async (values, {resetForm}) => {
      const comparisonResult = compareArrays(contractPaymentTerms?.data, [
        values.otherPaymentTerm,
      ]);

      // Collect all promises from mutations
      const mutationPromises: Promise<any>[] = [];

      if (comparisonResult.modifiedItems?.length) {
        comparisonResult.modifiedItems.forEach((pt) => {
          if (pt.id) {
            const updatePromise = updateContractPaymentTerm({
              body: {
                term: pt.term,
              },
              paymentTermId: pt.id,
            });
            mutationPromises.push(updatePromise);
          }
        });
      }

      if (comparisonResult.newItems?.length) {
        comparisonResult.newItems.forEach((pt) => {
          if (pt.term) {
            const createPromise = createContractPaymentTerm({
              serviceCompanyId: user!.userAccount.serviceCompany.id,
              term: pt.term,
            });
            mutationPromises.push(createPromise);
          }
        });
      }
      await Promise.all(mutationPromises);
      resetForm();
      onCancel();
      setPaymentToEdit(undefined);
    },
    validateOnMount: false,
  });

  return (
    <Drawer
      open={open ?? false}
      anchor="right"
      onClose={onCancel}
      aria-labelledby="alert-dialog-title"
      PaperProps={{
        sx: {
          width: '32em',
          color: 'text.primary',
          background: 'white',
        },
      }}>
      <Box
        sx={{
          fontWeight: 400,
          padding: '14px 0px 0px 11px',
          fontSize: '20px',
        }}
        justifyContent="start"
        flexDirection="row-reverse"
        display="flex"
        alignItems="center">
        {title}{' '}
        <IconButton onClick={onCancel}>
          <ArrowBackIosNewIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{pb: 5}}>
        <FormInput
          props={{
            size: 'small',
            placeholder: t('Enter your payment term...'),
            label: t('Payment Terms'),
            name: 'otherPaymentTerm.term',
            onChange: formik.handleChange,
            value: formik.values.otherPaymentTerm.term,
            helperText: formik.errors.otherPaymentTerm?.term,
            error: !!formik.errors.otherPaymentTerm?.term,
            InputProps: {
              endAdornment: (
                <InputAdornment position="end">
                  <LeftRightArrow />
                </InputAdornment>
              ),
            },
            sx: {
              mt: '0.5em',
            },
          }}
        />
      </DialogContent>

      <Box sx={{p: 3}} display="flex" justifyContent="space-between">
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
        <LoadingButton
          buttonProps={{
            variant: 'contained',
            size: 'medium',
            disabled: !formik.values.otherPaymentTerm.term,
            onClick: () => formik.handleSubmit(),
            loading: updateLoading || createLoading,
          }}>
          <Typography variant="subtitle2">{t('Save')}</Typography>
        </LoadingButton>
      </Box>
    </Drawer>
  );
};
