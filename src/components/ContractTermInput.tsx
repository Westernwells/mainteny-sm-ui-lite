import {Dispatch, SetStateAction, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {useFormik} from 'formik';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import {Box, Drawer} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import {createEmptyResource} from 'utils/paging-utils';
import {useContractTerms} from 'hooks/reactQuery/useCompanies';
import {Button} from 'components/Button';
import {Button as LoadingButton} from 'components/LoadingButton';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {getUniqueId} from 'utils/utils';
import {compareArrays} from 'utils/contract-terms';
import {ContractTermView} from 'models/contract';
import {
  useCreateContractTerm,
  useUpdateContractTerm,
} from 'hooks/reactQuery/useContractPaymentTerms';
import {ServiceCompanyType} from 'models/service-company';
import {FormInput} from './form/FormInput';

interface Props {
  open?: boolean;
  onCancel: () => void;
  title: string;
  defaultTerm?: ContractTermView;
  serviceCompanyType?: ServiceCompanyType;
  setEdit: Dispatch<SetStateAction<ContractTermView | undefined>>;
}

const pageSize = 50;

export const ContractTermInput = ({
  open,
  onCancel,
  title,
  defaultTerm,
  setEdit,
  serviceCompanyType = ServiceCompanyType.PROPERTY_OWNER_PAYMENT_TERM,
}: Props) => {
  const {t} = useTranslation();
  const {user} = useUserSession();
  const isContract = serviceCompanyType === ServiceCompanyType.CONTRACT_NAME;

  const {mutateAsync: createContractTerm, isLoading: createLoading} =
    useCreateContractTerm();
  const {mutateAsync: updateContractTerm, isLoading: updateLoading} =
    useUpdateContractTerm();
  const {data: contractTerms = createEmptyResource(pageSize)} =
    useContractTerms({
      page: {
        pageIndex: 0,
        pageSize,
      },
      query: '',
      type: serviceCompanyType,
    });

  const formik = useFormik<{
    otherTerm: {id: string; term: string};
  }>({
    initialValues: {
      otherTerm: {
        id: defaultTerm ? defaultTerm.id : getUniqueId(),
        term: defaultTerm ? defaultTerm.term : '',
      },
    },
    onSubmit: async (values, {resetForm}) => {
      const comparisonResult = compareArrays(contractTerms?.data, [
        values.otherTerm,
      ]);

      const mutationPromises: Promise<any>[] = [];

      if (comparisonResult.modifiedItems?.length) {
        comparisonResult.modifiedItems.forEach((pt) => {
          if (pt.id) {
            const updatePromise = updateContractTerm({
              body: {
                term: pt.term,
                type: serviceCompanyType,
              },
              termId: pt.id,
            });
            mutationPromises.push(updatePromise);
          }
        });
      }

      if (comparisonResult.newItems?.length) {
        comparisonResult.newItems.forEach((pt) => {
          if (pt.term) {
            const createPromise = createContractTerm({
              serviceCompanyId: user!.userAccount.serviceCompany.id,
              term: pt.term,
              type: serviceCompanyType,
            });
            mutationPromises.push(createPromise);
          }
        });
      }
      await Promise.all(mutationPromises);
      resetForm();
      onCancel();
      setEdit(undefined);
    },
    validateOnMount: false,
  });

  useEffect(() => {
    if (defaultTerm) {
      formik.setFieldValue('otherTerm', {
        id: defaultTerm ? defaultTerm.id : getUniqueId(),
        term: defaultTerm ? defaultTerm.term : '',
      });
    }
  }, [defaultTerm]);

  return (
    <Drawer
      open={open ?? false}
      anchor="right"
      onClose={onCancel}
      aria-labelledby="alert-dialog-title"
      ModalProps={{
        style: {zIndex: 1400},
      }}
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
            placeholder: isContract
              ? t('Enter your contract name...')
              : t('Enter your payment term...'),
            label: isContract ? t('Contract Name') : t('Payment Terms'),
            name: 'otherTerm.term',
            onChange: formik.handleChange,
            value: formik.values.otherTerm.term,
            helperText: formik.errors.otherTerm?.term,
            error: !!formik.errors.otherTerm?.term,
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
            disabled: !formik.values.otherTerm.term,
            onClick: () => formik.handleSubmit(),
            loading: updateLoading || createLoading,
          }}>
          <Typography variant="subtitle2">{t('Save')}</Typography>
        </LoadingButton>
      </Box>
    </Drawer>
  );
};
