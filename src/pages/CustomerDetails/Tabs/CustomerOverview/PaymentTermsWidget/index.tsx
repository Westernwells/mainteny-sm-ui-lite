import {FC, useState} from 'react';
import EditIcon from '@mui/icons-material/Edit';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {EmptySection} from 'components/EmptySection';
import {InfoCard} from 'components/InfoCard';
import {useTranslation} from 'react-i18next';
import {ContractPaymentTermView} from 'models/contract';
import {PropertyOwnerView} from 'models/propertyManager';
import {useCustomer} from 'hooks/reactQuery/useCustomers';
import {phoneNumberDigitsOnly} from 'utils/customer-utils';
import {ContractPaymentTermInput as NewPaymentTerm} from 'components/ContractPaymentTermInput';
import {ContractPaymentTerm} from 'components/ContractPaymentTerm';
import {Loading} from 'components/Loading';
import {CustomerEditForm} from '../EditCustomerForm/model';

interface Props {
  customer?: PropertyOwnerView;
}

const PaymentTermsWidget: FC<Props> = ({customer}) => {
  const {t} = useTranslation();
  const [showSideDrawer, setShowSideDrawer] = useState(false);
  const [showNewPaymentTermDrawer, setShowNewPaymentTermDrawer] =
    useState(false);
  const [paymentTermToEdit, setPaymentTermToEdit] = useState<
    ContractPaymentTermView | undefined
  >(undefined);
  const {updateCustomer, isLoading} = useCustomer();

  const handlePaymentTermSubmit = (paymentTermId: string) => {
    if (customer) {
      const customerInfo: CustomerEditForm = {
        name: customer.name,
        phone: customer.contact.phone
          ? phoneNumberDigitsOnly(customer.contact.phone)
          : '',
        url: customer.contact.url,
        email: customer.contact.email,
        billingEmail: customer.additionalInfo.billingEmail,
        costCenter: customer.additionalInfo.costCenter,
        registrationDate: customer.additionalInfo.registrationDate,
        secondaryPhoneNumber: customer.additionalInfo.secondaryPhoneNumber
          ? phoneNumberDigitsOnly(customer.additionalInfo.secondaryPhoneNumber)
          : '',
        billingAddress: customer.billingAddress
          ? customer.billingAddress
          : null,
        beneficiaryAddress: customer.beneficiaryAddress
          ? customer.beneficiaryAddress
          : null,
        otherAddress: customer.otherAddress ? customer.otherAddress : null,
        priority: customer.additionalInfo.priority,
        externalId: customer.externalId,
        vatId: customer.additionalInfo.vatId || '',
        offsettingAccount: customer.additionalInfo.offsettingAccount || '',
        // Update payment term
        paymentTermId,
      };
      updateCustomer({...customerInfo}, customer?.id, () => {
        setShowSideDrawer(false);
      });
    }
  };

  if (isLoading) return <Loading />;

  return (
    <>
      <InfoCard
        header={
          <Box display="flex">
            <Typography variant="subtitle1">{t('Payment terms')}</Typography>
          </Box>
        }
        containerStyles={{flexGrow: 1}}
        headerStyles={{mt: '0.5em'}}
        headerActionIcon={<EditIcon />}
        handleAction={() => setShowSideDrawer(true)}
        showHeaderBackground>
        {customer?.paymentTerm ? (
          <p>{customer.paymentTerm.term}</p>
        ) : (
          <EmptySection
            illustration="clipboard"
            size="tiny"
            containerStyle={{m: 'auto', width: '60%'}}
            label={t('No payment terms applied.')}
          />
        )}
      </InfoCard>
      <ContractPaymentTerm
        title={t('Payment Terms')}
        open={showSideDrawer}
        onCancel={() => setShowSideDrawer(false)}
        onSave={handlePaymentTermSubmit}
        defaultPayment={customer?.paymentTerm?.id}
        onClickNewPaymentTerm={() => setShowNewPaymentTermDrawer(true)}
        setPaymentToEdit={setPaymentTermToEdit}
      />
      <NewPaymentTerm
        title={t('New payment term')}
        open={showNewPaymentTermDrawer}
        onCancel={() => setShowNewPaymentTermDrawer(false)}
        defaultPaymentTerm={paymentTermToEdit}
        setPaymentToEdit={setPaymentTermToEdit}
      />
    </>
  );
};

export default PaymentTermsWidget;
