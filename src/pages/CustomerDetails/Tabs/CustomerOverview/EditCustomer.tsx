import React from 'react';
import {Formik} from 'formik';
import * as Yup from 'yup';

import {PropertyOwnerView} from 'models/propertyManager';
import {useCustomer} from 'hooks/reactQuery/useCustomers';
import {Mixpanel} from 'mixpanel/mixpanel';
import {mixpanelEvents} from 'mixpanel/constants';
import {CustomerEditForm} from './EditCustomerForm/model';
import {EditCustomerForm} from './EditCustomerForm';

interface Props {
  customer: PropertyOwnerView;
  openDialog: boolean;
  onClose: () => void;
}

export const EditCustomer = ({customer, openDialog, onClose}: Props) => {
  const {updateCustomer} = useCustomer();

  const initialValues: CustomerEditForm = {
    name: customer.name,
    phone: customer.contact.phone.split('+')[1] || customer.contact.phone,
    url: customer.contact.url,
    email: customer.contact.email,
    billingEmail: customer.additionalInfo.billingEmail,
    costCenter: customer.additionalInfo.costCenter,
    registrationDate: customer.additionalInfo.registrationDate,
    secondaryPhoneNumber:
      customer.additionalInfo.secondaryPhoneNumber?.split('+')?.[1] ??
      customer.additionalInfo.secondaryPhoneNumber,
    postalAddress: customer.postalAddress
      ? {
          fullName: customer.postalAddress.fullName,
          countryCode: customer.postalAddress.countryCode,
          location: {
            longitude: customer.postalAddress.location.longitude,
            latitude: customer.postalAddress.location.latitude,
          },
        }
      : null,
    billingAddress: customer.billingAddress
      ? {
          fullName: customer.billingAddress.fullName,
          countryCode: customer.billingAddress.countryCode,
          location: {
            longitude: customer.billingAddress.location.longitude,
            latitude: customer.billingAddress.location.latitude,
          },
        }
      : null,
    businessAddress: customer.businessAddress
      ? {
          fullName: customer.businessAddress.fullName,
          countryCode: customer.businessAddress.countryCode,
          location: {
            longitude: customer.businessAddress.location.longitude,
            latitude: customer.businessAddress.location.latitude,
          },
        }
      : null,
    priority: customer.additionalInfo.priority,
    externalId: customer.externalId,
  };

  const phoneValidationRE =
    /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    email: Yup.string()
      .email('Enter a valid email')
      .required('Email is required'),
    externalId: Yup.string(),
    phone: Yup.string().matches(phoneValidationRE, 'Phone number is not valid'),
    postalAddress: Yup.object().nullable(),
    billingAddress: Yup.object().nullable(),
  });

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
