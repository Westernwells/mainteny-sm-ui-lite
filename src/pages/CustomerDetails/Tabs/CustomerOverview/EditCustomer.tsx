import {Formik} from 'formik';
import * as Yup from 'yup';

import {PropertyOwnerView} from 'models/propertyManager';
import {useCustomer} from 'hooks/reactQuery/useCustomers';
import {phoneNumberDigitsOnly} from 'utils/customer-utils';
import {Mixpanel} from 'mixpanel/mixpanel';
import {mixpanelEvents} from 'mixpanel/constants';
import {CustomerEditForm} from './EditCustomerForm/model';
import {EditCustomerForm} from './EditCustomerForm';

interface Props {
  customer: PropertyOwnerView;
  openDialog: boolean;
  onClose: () => void;
}

const phoneValidationRE =
  /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Customer Name is required'),
  email: Yup.string().email('Enter a valid email'),
  billingEmail: Yup.string().email('Enter a valid email'),
  phone: Yup.string().matches(phoneValidationRE, 'Phone number is not valid'),
  secondaryPhoneNumber: Yup.string().matches(
    phoneValidationRE,
    'Phone number is not valid',
  ),
  billingAddress: Yup.object().nullable(),
  beneficiaryAddress: Yup.object().nullable(),
  otherAddress: Yup.object().nullable(),
});

export const EditCustomer = ({customer, openDialog, onClose}: Props) => {
  const {updateCustomer} = useCustomer();

  const initialValues: CustomerEditForm = {
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
    billingAddress: customer.billingAddress ? customer.billingAddress : null,
    beneficiaryAddress: customer.beneficiaryAddress
      ? customer.beneficiaryAddress
      : null,
    otherAddress: customer.otherAddress ? customer.otherAddress : null,
    priority: customer.additionalInfo.priority,
    externalId: customer.externalId,
    taxNumber: customer.additionalInfo.taxNumber || '',
    offsettingAccount: '',
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={async (values, {resetForm}) => {
        updateCustomer({...values}, customer.id, () => {
          resetForm();
          onClose();
        });
        Mixpanel.identifyAndTrack(mixpanelEvents.CUSTOMERS_EDIT_CLICK, {
          pageName: 'Customers',
          creationTime: new Date(),
          save: 1,
          cancel: 0,
          source: 'Basic Information',
        });
      }}>
      <EditCustomerForm openDialog={openDialog} onClose={onClose} />
    </Formik>
  );
};
