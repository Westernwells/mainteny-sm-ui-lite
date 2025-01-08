import {Box} from '@mui/material';
import {Card} from 'components/Card';
import {CardDataListItem} from 'components/CardDataListItem';
import React, {useState} from 'react';
import {
  LocationOnOutlined,
  EmailOutlined,
  RequestPageOutlined,
  InfoOutlined,
  AttachMoneyOutlined,
  AccountBalanceOutlined,
  DocumentScannerOutlined,
  LocalAtmOutlined,
} from '@mui/icons-material';
import {PropertyOwnerView} from 'models/propertyManager';
import {Dialog} from 'components/Dialog';
import {useForm} from 'react-hook-form';
import {CustomerFinanceFormModel} from 'models/customer';
import {useCustomer} from 'hooks/reactQuery/useCustomers';
import {t} from 'i18next';
import {convertToText, formatAddressFullname} from 'utils/utils';
import {ReactComponent as SavingBankCash} from 'assets/illustrations/SavingBankCash.svg';
import {CustomTranslationOptions} from 'pages/CompanyDetails/BasicInformation';
import {useTranslation} from 'react-i18next';
import {useCompanyById} from 'hooks/reactQuery/useCompanies';
import {companyLanguageContextMap} from 'utils/language';
import {EditFinanceInformation} from './EditFinanceInformation';

type Props = {
  customer: PropertyOwnerView;
};

const FinanceWidget = ({customer}: Props) => {
  const [openDialog, setOpenDialog] = useState(false);

  const {updateCustomer} = useCustomer(true);

  const {data: company} = useCompanyById(customer?.serviceCompany?.id);

  const {t: translateCompanyLanguage} = useTranslation('translation', {
    lng: companyLanguageContextMap[company?.language as string],
  } as CustomTranslationOptions);

  const {handleSubmit, control, setValue, watch, reset, formState} = useForm({
    mode: 'onChange',
    defaultValues: {
      vat: customer.additionalInfo.vat?.id || '',
      paymentTermId: customer.paymentTerm?.id || '',
      ean: customer.additionalInfo.ean || '',
      invoiceFormat: customer.additionalInfo.invoiceFormat || '',
      offsettingAccount: customer.additionalInfo.offsettingAccount || '',
      costCenter: customer.additionalInfo.costCenter || '',
      buyerReference: customer.additionalInfo.buyerReference || '',
      billingAddress: customer.billingAddress || null,
      otherAddress: customer.otherAddress || null,
      beneficiaryAddress: customer.beneficiaryAddress || null,
      billingEmail: customer.additionalInfo.billingEmail || '',
    },
  });

  const {errors} = formState;

  const discountOptions =
    customer?.paymentTerm?.data?.discountOptions?.map((o) =>
      o.discountDays === 0 && o.discountPercent === 0
        ? ''
        : `${o.discountDays} ${t('days')}; ${o.discountPercent}% ${t(
            'Discount_contract',
          )}; ${t(convertToText(o.articleType))}`,
    ) ?? [];

  const formattedDiscountOptions = discountOptions?.join('\n');
  const paymentTerm = `${customer?.paymentTerm?.term}\n${formattedDiscountOptions}`;

  const onSave = async (data: CustomerFinanceFormModel) => {
    const finalData = {
      ...data,
      beneficiaryAddress: data.beneficiaryAddress
        ? {
            ...data.beneficiaryAddress,
            component: {
              ...data.beneficiaryAddress?.component,
              country: data.beneficiaryAddress?.component?.country
                ? translateCompanyLanguage(
                    data.beneficiaryAddress.component.country,
                  )
                : '',
            },
            fullName:
              formatAddressFullname(
                data.beneficiaryAddress,
                translateCompanyLanguage,
              )?.fullName || '',
          }
        : null,
      otherAddress: data.otherAddress
        ? {
            ...data.otherAddress,
            component: {
              ...data.otherAddress?.component,
              country: data.otherAddress?.component?.country
                ? translateCompanyLanguage(data.otherAddress.component.country)
                : '',
            },
            fullName:
              formatAddressFullname(data.otherAddress, translateCompanyLanguage)
                ?.fullName || '',
          }
        : null,
      billingAddress: data.billingAddress
        ? {
            ...data.billingAddress,
            component: {
              ...data.billingAddress?.component,
              country: data.billingAddress?.component?.country
                ? translateCompanyLanguage(
                    data.billingAddress.component.country,
                  )
                : '',
            },
            fullName:
              formatAddressFullname(
                data.billingAddress,
                translateCompanyLanguage,
              )?.fullName || '',
          }
        : null,
    };

    await updateCustomer(finalData, customer.id, () => {
      setOpenDialog(false);
      reset({
        vat: finalData.vat || '',
        paymentTermId: finalData.paymentTermId || '',
        ean: finalData.ean || '',
        invoiceFormat: finalData.invoiceFormat || '',
        offsettingAccount: finalData.offsettingAccount || '',
        costCenter: finalData.costCenter || '',
        buyerReference: finalData.buyerReference || '',
        billingAddress: finalData.billingAddress || null,
        otherAddress: finalData.otherAddress || null,
        beneficiaryAddress: finalData.beneficiaryAddress || null,
        billingEmail: finalData.billingEmail || '',
      });
    });
  };

  return (
    <>
      <Card
        title="Finance"
        actionHandler={() => setOpenDialog(true)}
        Icon={SavingBankCash}
        containerProps={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0.75,
          px: 3,
        }}>
        <Box display="flex" flexDirection="column" gap={0.75}>
          <CardDataListItem
            label="Billing Address"
            value={customer?.billingAddress?.fullName || '-'}
            Icon={LocationOnOutlined}
          />

          <CardDataListItem
            label="Send invoice via"
            value={customer?.otherAddress?.fullName || '-'}
            Icon={LocationOnOutlined}
          />

          <CardDataListItem
            label="Beneficiary address"
            value={customer.beneficiaryAddress?.fullName || '-'}
            Icon={LocationOnOutlined}
          />

          <CardDataListItem
            label="Billing email address"
            value={customer.additionalInfo.billingEmail || '-'}
            Icon={EmailOutlined}
          />

          <CardDataListItem
            label="VAT rate"
            value={
              customer.additionalInfo.vat
                ? `${customer.additionalInfo.vat?.percentage}%`
                : '-'
            }
            Icon={RequestPageOutlined}
          />

          <CardDataListItem
            label="Buyer reference"
            value={customer.additionalInfo.buyerReference || '-'}
            Icon={InfoOutlined}
          />

          <CardDataListItem
            label="Cost Center"
            value={customer.additionalInfo.costCenter || '-'}
            Icon={AttachMoneyOutlined}
          />

          <CardDataListItem
            label="Offsetting Account"
            value={customer.additionalInfo.offsettingAccount || '-'}
            Icon={AccountBalanceOutlined}
          />

          <CardDataListItem
            label="Invoice format"
            value={customer.additionalInfo.invoiceFormat || '-'}
            Icon={DocumentScannerOutlined}
          />

          <CardDataListItem
            label="EAN"
            value={customer.additionalInfo.ean || '-'}
            Icon={InfoOutlined}
          />

          <CardDataListItem
            label="Payment terms"
            value={customer.paymentTerm ? paymentTerm : '-'}
            Icon={LocalAtmOutlined}
          />
        </Box>
      </Card>

      <Dialog
        title="Finance"
        saveBtnType="submit"
        onCancel={() => {
          setOpenDialog(false);
          reset();
        }}
        onSave={handleSubmit(onSave)}
        saveButtonText="Save Changes"
        disableSaveBtn={!!Object.keys(errors).length}
        dialogProps={{
          maxWidth: 'md',
          open: openDialog || false,
        }}
        dialogContentStyles={{
          mx: 0,
          mt: 0,
          px: 3,
        }}>
        <EditFinanceInformation
          control={control}
          errors={errors}
          setValue={setValue}
          watch={watch}
        />
      </Dialog>
    </>
  );
};

export default FinanceWidget;
