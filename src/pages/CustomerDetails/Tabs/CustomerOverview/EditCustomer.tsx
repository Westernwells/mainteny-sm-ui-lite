import {Formik, useFormik} from 'formik';
import {PropertyOwnerView} from 'models/propertyManager';
import {useCustomer, useQueryCustomers} from 'hooks/reactQuery/useCustomers';
import {phoneNumberDigitsOnly} from 'utils/customer-utils';
import {useEffect, useState} from 'react';
import {createEmptyResource} from 'utils/paging-utils';
import * as Yup from 'yup';
import {CustomerEditForm} from './EditCustomerForm/model';
import {EditCustomerForm} from './EditCustomerForm';

interface Props {
  customer: PropertyOwnerView;
  openDialog: boolean;
  onClose: () => void;
}

const phoneValidationRE =
  /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;

const isExternalIdUnique = async (
  resource: PropertyOwnerView[],
  value?: string,
) => {
  if (!value) {
    return true;
  }
  try {
    return !(resource && resource.some((item) => item.externalId === value));
  } catch (error) {
    console.error('Error checking externalId uniqueness:', error);
    return true;
  }
};

export const EditCustomer = ({customer, openDialog, onClose}: Props) => {
  const {updateCustomer} = useCustomer();

  const [initialCustomerId, setInitialCustomerId] = useState('');
  const [currentCustomerId, setCurrentCustomerId] = useState('');

  const {data: customerResource = createEmptyResource<PropertyOwnerView>(50)} =
    useQueryCustomers(
      {
        pageIndex: 0,
        pageSize: 50,
        query: currentCustomerId,
      },
      {keepPreviousData: true},
    );

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
    vatId: customer.additionalInfo.vatId || '',
    offsettingAccount: customer.additionalInfo.offsettingAccount || '',
  };

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
    externalId: Yup.string().test(
      'checkExternalId',
      'This ID is already taken. Please enter a different one.',
      async (value) => {
        if (value !== initialCustomerId) {
          return isExternalIdUnique(customerResource.data, value);
        }
        return true;
      },
    ),
  });

  const handleSubmit = async (values: CustomerEditForm) => {
    updateCustomer(values, customer.id, () => {
      onClose();
    });
  };

  const formik = useFormik<CustomerEditForm>({
    initialValues,
    onSubmit: handleSubmit,
    validationSchema,
  });

  useEffect(() => {
    setInitialCustomerId(formik.values.externalId);
  }, []);

  return (
    <Formik
      validationSchema={validationSchema}
      initialValues={initialValues}
      enableReinitialize
      onSubmit={handleSubmit}>
      <EditCustomerForm
        openDialog={openDialog}
        onClose={onClose}
        setCurrentCustomerId={setCurrentCustomerId}
      />
    </Formik>
  );
};
