import {useState} from 'react';
import {t} from 'i18next';
import {Controller, UseFormSetValue} from 'react-hook-form';
import {theme} from 'theme';
import {
  Grid2 as Grid,
  Box,
  Tab,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  IconButton,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import {FormInput} from 'components/form/FormInput';
import {CUSTOMER_ALL_INVOICE_FORMATS} from 'utils/constants';
import {useVats} from 'hooks/reactQuery/useVats';
import {TabContext, TabList, TabPanel} from '@mui/lab';
import {CustomerFinanceFormModel} from 'models/customer';
import RichTextField from 'components/RichTextField';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import {ContractTerm} from 'components/ContractTerm';
import {ContractTermInput} from 'components/ContractTermInput';
import {ContractTermView} from 'models/contract';
import {ServiceCompanyType} from 'models/service-company';
import {useContractTerms} from 'hooks/reactQuery/useCompanies';
import {createEmptyResource} from 'utils/paging';
import {convertToText} from 'utils/utils';
import {Receipt} from '@mui/icons-material';
import {EditFinanceAddress} from './EditFinanceAddress';

interface Props {
  control: any;
  errors: any;
  setValue: UseFormSetValue<CustomerFinanceFormModel>;
  watch: any;
}

export const EditFinanceInformation = ({
  control,
  errors,
  setValue,
  watch,
}: Props) => {
  const [openContractPaymentTermsDialog, setOpenContractPaymentTermsDialog] =
    useState(false);
  const [
    openContractPaymentTermSelectDialog,
    setOpenContractPaymentTermSelectDialog,
  ] = useState(false);
  const [paymentTermToEdit, setPaymentTermToEdit] = useState<
    ContractTermView | undefined
  >(undefined);

  const {data: contractPaymentTerms = createEmptyResource(500)} =
    useContractTerms({
      page: {
        pageIndex: 0,
        pageSize: 500,
      },
      query: '',
      type: ServiceCompanyType.PROPERTY_OWNER_PAYMENT_TERM,
    });

  const {data: taxRates} = useVats();

  const [activeTab, setActiveTab] = useState('billingAddress');

  return (
    <Grid container spacing={3}>
      <Grid size={{xs: 12}}>
        <TabContext value={activeTab}>
          <Box sx={{borderBottom: 1, borderColor: 'divider', width: '70%'}}>
            <TabList
              onChange={(_, newValue) => setActiveTab(newValue)}
              sx={{
                '& .MuiTabs-indicator': {
                  backgroundColor: theme.palette.primary.light,
                },
              }}>
              <Tab
                label={t('Billing address')}
                value="billingAddress"
                sx={{
                  textTransform: 'none',
                  typography: 'subtitle2',
                  fontWeight: '600',
                }}
              />
              <Tab
                label={t('Send invoice via')}
                value="otherAddress"
                sx={{
                  textTransform: 'none',
                  typography: 'subtitle2',
                  fontWeight: '600',
                }}
              />
              <Tab
                label={t('Beneficiary address')}
                value="beneficiaryAddress"
                sx={{
                  textTransform: 'none',
                  typography: 'subtitle2',
                  fontWeight: '600',
                }}
              />
            </TabList>
          </Box>

          {['billingAddress', 'otherAddress', 'beneficiaryAddress'].map(
            (address) => (
              <TabPanel key={address} value={address} sx={{px: 0}}>
                <EditFinanceAddress
                  address={
                    address as
                      | 'billingAddress'
                      | 'otherAddress'
                      | 'beneficiaryAddress'
                  }
                  control={control}
                  errors={errors}
                  setValue={
                    setValue as unknown as UseFormSetValue<CustomerFinanceFormModel>
                  }
                  watch={watch}
                />
              </TabPanel>
            ),
          )}
        </TabContext>
      </Grid>
      <Grid size={{xs: 12}} py={0} mt={-1}>
        <Typography variant="h6" color="primary.dark">
          {t('Other')}
        </Typography>
      </Grid>
      <Grid size={{xs: 4}}>
        <Controller
          name="buyerReference"
          control={control}
          render={({field}) => (
            <FormInput
              fieldProps={{
                size: 'small',
                label: 'Buyer Reference',
                ...field,
              }}
            />
          )}
        />
      </Grid>
      <Grid size={{xs: 4}}>
        <Controller
          name="costCenter"
          control={control}
          render={({field}) => (
            <FormInput
              fieldProps={{
                size: 'small',
                label: 'Cost Center',
                ...field,
              }}
            />
          )}
        />
      </Grid>
      <Grid size={{xs: 4}}>
        <Controller
          name="offsettingAccount"
          control={control}
          render={({field}) => (
            <FormInput
              fieldProps={{
                size: 'small',
                label: 'Offsetting Account',
                ...field,
              }}
            />
          )}
        />
      </Grid>
      <Grid size={{xs: 4}}>
        <Controller
          name="invoiceFormat"
          control={control}
          render={({field}) => (
            <FormControl fullWidth>
              <InputLabel size="small" shrink variant="outlined">
                {t('Invoice format')}
              </InputLabel>
              <Select
                {...field}
                label={t('Invoice format')}
                size="small"
                notched>
                {CUSTOMER_ALL_INVOICE_FORMATS.map((format) => (
                  <MenuItem value={format.value} key={format.value}>
                    {t(format.label)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
      </Grid>
      <Grid size={{xs: 4}}>
        <Controller
          name="ean"
          control={control}
          render={({field}) => (
            <FormInput
              fieldProps={{
                size: 'small',
                label: 'EAN',
                ...field,
              }}
            />
          )}
        />
      </Grid>
      <Grid size={{xs: 4}}>
        <Controller
          name="vat"
          control={control}
          render={({field}) => (
            <FormControl fullWidth>
              <InputLabel size="small" shrink variant="outlined">
                {t('Tax rate')}
              </InputLabel>
              <Select
                {...field}
                label={t('Tax rate')}
                size="small"
                renderValue={(selected) => {
                  const selectedTaxRate = taxRates?.find(
                    (rate) => rate.id === selected,
                  );
                  return selectedTaxRate
                    ? `${selectedTaxRate.percentage || 0}%`
                    : '';
                }}>
                {taxRates?.map((taxRate) => (
                  <MenuItem
                    value={taxRate.id}
                    key={taxRate.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <Box>
                      <Typography
                        variant="body2"
                        color="primary.dark"
                        sx={{fontWeight: 'bold'}}>
                        {taxRate.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{color: theme.palette.text.secondary}}>
                        {taxRate.percentage || 0}%
                      </Typography>
                    </Box>
                    <Tooltip
                      title={taxRate.legalNote || ''}
                      arrow
                      placement="top">
                      <Box>
                        <IconButton
                          size="small"
                          sx={{
                            p: 0,
                            color: taxRate.legalNote
                              ? theme.palette.text.primary
                              : theme.palette.text.disabled,
                          }}>
                          <Receipt fontSize="small" />
                        </IconButton>
                      </Box>
                    </Tooltip>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
      </Grid>
      <Grid size={{md: 6}}>
        <Controller
          name="paymentTermId"
          control={control}
          render={({field}) => {
            const selectedTerm = contractPaymentTerms?.data.find(
              (term) => term.id === field.value,
            );
            const paymentTermDetails = selectedTerm
              ? [
                  selectedTerm.term,
                  ...(selectedTerm.data?.discountOptions?.map(
                    (option) =>
                      `${option.discountDays} days; ${
                        option.discountPercent
                      }% Discount; ${t(convertToText(option.articleType))}`,
                  ) || []),
                ].join('\n')
              : '<p></p>';

            return (
              <RichTextField
                data-testid="payment-terms-rich-text-field"
                label="Payment terms"
                html={paymentTermDetails}
                updateHtml={() => {}}
                minRows={1}
                onBlur={field.onBlur}
                endAdornment={
                  <InputAdornment
                    component={IconButton}
                    disableRipple
                    position="end"
                    sx={{
                      mr: -1,
                      alignSelf: 'flex-start',
                    }}
                    onClick={() => setOpenContractPaymentTermsDialog(true)}
                    size="small">
                    <TextSnippetIcon />
                  </InputAdornment>
                }
              />
            );
          }}
        />
      </Grid>
      {openContractPaymentTermSelectDialog && (
        <ContractTermInput
          title={
            paymentTermToEdit ? t('Edit payment term') : t('New payment term')
          }
          open={openContractPaymentTermSelectDialog}
          onCancel={() => setOpenContractPaymentTermSelectDialog(false)}
          defaultTerm={paymentTermToEdit}
          setEdit={setPaymentTermToEdit}
        />
      )}
      {openContractPaymentTermsDialog && (
        <ContractTerm
          title={t('Payment terms')}
          open={openContractPaymentTermsDialog}
          onCancel={() => setOpenContractPaymentTermsDialog(false)}
          onSave={(selectedPaymentTermId) => {
            setValue('paymentTermId', selectedPaymentTermId);
            setOpenContractPaymentTermsDialog(false);
          }}
          defaultValue={watch('paymentTermId') || ''}
          onClick={() => setOpenContractPaymentTermSelectDialog(true)}
          setEdit={setPaymentTermToEdit}
        />
      )}
    </Grid>
  );
};
