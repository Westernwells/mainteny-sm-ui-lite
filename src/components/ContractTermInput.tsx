import {Dispatch, SetStateAction, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {FormikProps, useFormik} from 'formik';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import {Box, Drawer} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {createEmptyResource} from 'utils/paging-utils';
import {useContractTerms} from 'hooks/reactQuery/useCompanies';
import {Button} from 'components/Button';
import {Button as LoadingButton} from 'components/LoadingButton';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {getUniqueId} from 'utils/utils';
import {compareArrays} from 'utils/contract-terms';
import {
  ContractTermView,
  DiscountOption as DiscountOptionType,
  PaymentTermArticleType,
  PaymentTermData,
  UpdateContractPaymentTermView,
} from 'models/contract';
import {
  useCreateContractPaymentTerm,
  useCreateContractTerm,
  useUpdateContractPaymentTerm,
  useUpdateContractTerm,
} from 'hooks/reactQuery/useContractPaymentTerms';
import {ServiceCompanyType} from 'models/service-company';
import {FormInput} from './form/FormInput';
import {FormSelect} from './form/FormSelect';

interface DiscountOptionProps {
  index: number;
  discountOption: DiscountOptionType;
  formik: FormikProps<{
    otherTerm: {id: string; term: string; paymentTermData: PaymentTermData};
  }>;
}

const DiscountOption = ({
  index,
  discountOption,
  formik,
}: DiscountOptionProps) => {
  const removeDiscountOption = () => {
    formik.setFieldValue(
      `otherTerm.paymentTermData.discountOptions`,
      formik.values.otherTerm.paymentTermData.discountOptions.filter(
        (_, i) => i !== index,
      ),
    );
  };

  return (
    <Box display="flex" alignItems="center" gap={1} pt={1.5}>
      <Typography variant="body2">{index + 1}</Typography>

      <FormInput
        fieldProps={{
          name: `otherTerm.paymentTermData.discountOptions.${index}.discountDays`,
          label: 'Discount days',
          type: 'number',
          onChange: formik.handleChange,
          value: discountOption.discountDays,
          onBlur: formik.handleBlur,
        }}
      />

      <FormInput
        fieldProps={{
          name: `otherTerm.paymentTermData.discountOptions.${index}.discountPercent`,
          label: 'Discount %',
          type: 'number',
          onChange: formik.handleChange,
          value: discountOption.discountPercent,
          onBlur: formik.handleBlur,
        }}
      />

      <FormSelect
        labelId={`article-type-label-${index}`}
        label="Included articles"
        selectProps={{
          name: `otherTerm.paymentTermData.discountOptions.${index}.articleType`,
          label: 'Included articles',
          onChange: formik.handleChange,
          value: discountOption.articleType,
          onBlur: formik.handleBlur,
        }}
        options={[
          {
            label: 'All',
            value: PaymentTermArticleType.ALL,
          },
          {
            label: 'Material',
            value: PaymentTermArticleType.MATERIAL,
          },
          {
            label: 'Labor',
            value: PaymentTermArticleType.LABOR,
          },
        ]}
        menuProps={{style: {zIndex: 10000}}}
      />

      {formik.values.otherTerm.paymentTermData.discountOptions.length > 1 && (
        <IconButton
          size="small"
          sx={{color: 'text.disabled'}}
          onClick={removeDiscountOption}>
          <DeleteOutlineIcon />
        </IconButton>
      )}
    </Box>
  );
};

interface Props {
  open?: boolean;
  onCancel: () => void;
  title: string;
  defaultTerm?: ContractTermView;
  serviceCompanyType?: ServiceCompanyType;
  setEdit: Dispatch<SetStateAction<ContractTermView | undefined>>;
}

const defaultDiscountOptions = [
  {
    discountDays: 0,
    discountPercent: 0,
    articleType: PaymentTermArticleType.ALL,
  },
];

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
  const {
    mutateAsync: createContractPaymentTerm,
    isLoading: createPaymentTermLoading,
  } = useCreateContractPaymentTerm();
  const {
    mutateAsync: updateContractPaymentTerm,
    isLoading: updatePaymentTermLoading,
  } = useUpdateContractPaymentTerm();
  const {data: contractTerms = createEmptyResource(500)} = useContractTerms({
    page: {
      pageIndex: 0,
      pageSize: 500,
    },
    query: '',
    type: serviceCompanyType,
  });

  const handleOnCancel = () => {
    setEdit(undefined);
    onCancel();
  };

  const formik = useFormik<{
    otherTerm: {id: string; term: string; paymentTermData: PaymentTermData};
  }>({
    initialValues: {
      otherTerm: {
        id: defaultTerm ? defaultTerm.id : getUniqueId(),
        term: defaultTerm ? defaultTerm.term : '',
        paymentTermData: {
          dueDays: defaultTerm?.data?.dueDays || 0,
          discountOptions: defaultTerm?.data?.discountOptions?.length
            ? defaultTerm.data.discountOptions
            : defaultDiscountOptions,
        },
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
            const updatePromise = isContract
              ? updateContractTerm({
                  body: {
                    term: pt.term,
                    type: serviceCompanyType,
                  },
                  termId: pt.id,
                })
              : updateContractPaymentTerm({
                  body: {
                    term: pt.term,
                    paymentTermData: (pt as UpdateContractPaymentTermView)
                      .paymentTermData,
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
            const createPromise = isContract
              ? createContractTerm({
                  serviceCompanyId: user!.userAccount.serviceCompany.id,
                  term: pt.term,
                  type: serviceCompanyType,
                })
              : createContractPaymentTerm({
                  serviceCompanyId: user!.userAccount.serviceCompany.id,
                  term: pt.term,
                  paymentTermData: {
                    dueDays:
                      (pt as UpdateContractPaymentTermView).paymentTermData
                        ?.dueDays || 0,
                    discountOptions:
                      (pt as UpdateContractPaymentTermView)?.paymentTermData
                        ?.discountOptions || defaultDiscountOptions,
                  },
                });
            mutationPromises.push(createPromise);
          }
        });
      }
      await Promise.all(mutationPromises);
      resetForm();
      handleOnCancel();
    },
    validateOnMount: false,
  });

  useEffect(() => {
    if (defaultTerm) {
      formik.setFieldValue('otherTerm', {
        id: defaultTerm ? defaultTerm.id : getUniqueId(),
        term: defaultTerm ? defaultTerm.term : '',
        paymentTermData: {
          dueDays: defaultTerm.data?.dueDays || 0,
          discountOptions: defaultTerm.data?.discountOptions?.length
            ? defaultTerm.data?.discountOptions
            : defaultDiscountOptions,
        },
      });
    }
  }, [defaultTerm]);

  const addDiscountOption = () => {
    formik.setFieldValue('otherTerm.paymentTermData.discountOptions', [
      ...formik.values.otherTerm.paymentTermData.discountOptions,
      ...defaultDiscountOptions,
    ]);
  };

  return (
    <Drawer
      open={open ?? false}
      anchor="right"
      onClose={handleOnCancel}
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
        <IconButton onClick={handleOnCancel}>
          <ArrowBackIosNewIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{pb: 5}}>
        <FormInput
          fieldProps={{
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

        {!isContract && (
          <>
            <FormInput
              fieldProps={{
                size: 'small',
                label: t('Due days'),
                name: 'otherTerm.paymentTermData.dueDays',
                type: 'number',
                onChange: formik.handleChange,
                value: formik.values.otherTerm.paymentTermData.dueDays,
                helperText: formik.errors.otherTerm?.paymentTermData?.dueDays,
                error: !!formik.errors.otherTerm?.paymentTermData?.dueDays,
                sx: {
                  mt: 2.5,
                  width: '30%',
                },
              }}
            />
            <Typography
              variant="overline"
              component={Box}
              color="text.secondary"
              pt={3}>
              {t('DISCOUNT OPTIONS')}
            </Typography>
            {formik.values.otherTerm.paymentTermData.discountOptions.map(
              (discountOption, index) => (
                <DiscountOption
                  key={index}
                  index={index}
                  discountOption={discountOption}
                  formik={formik}
                />
              ),
            )}
            {formik.values.otherTerm.paymentTermData.discountOptions?.length ===
              1 && (
              <Button
                label={t('Add Discount Option')}
                buttonProps={{
                  variant: 'text',
                  size: 'small',
                  onClick: addDiscountOption,
                  sx: {
                    mt: 1.5,
                  },
                }}
              />
            )}
          </>
        )}
      </DialogContent>

      <Box sx={{p: 3}} display="flex" justifyContent="space-between">
        <Button
          buttonProps={{
            size: 'medium',
            onClick: () => {
              formik.resetForm();
              handleOnCancel();
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
            loading:
              updateLoading ||
              createLoading ||
              createPaymentTermLoading ||
              updatePaymentTermLoading,
          }}>
          <Typography variant="subtitle2">{t('Save')}</Typography>
        </LoadingButton>
      </Box>
    </Drawer>
  );
};
