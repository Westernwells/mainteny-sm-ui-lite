import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import MuiDialog, {DialogProps} from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {FlexContainer} from 'components/FlexContainer';
import {Stepper} from 'components/Stepper';
import {Priority} from 'models/service-order';
import {
  useCreateCustomer,
  useQueryCustomers,
} from 'hooks/reactQuery/useCustomers';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {useEffectAfterMount} from 'hooks/useEffectAfterMount';
import {formatPhoneNumber} from 'utils/customer-utils';
import {PropertyOwnerView} from 'models/propertyManager';
import {createEmptyResource} from 'utils/paging';
import {
  CustomerAddressFormModel,
  CustomerBasicInfoFormModel,
  CustomerContactPersonsFormModel,
  NewCustomerBody,
} from '../../NewCustomer/model';
import {BasicCustomerForm} from './BasicCustomerForm';
import {CustomerAddressForm} from './CustomerAddressForm';
import {CustomerContactPersonsForm} from './CustomerContactPersonsForm';

const phoneValidationRE =
  /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;

const validationSchemaBasicInfo = Yup.object().shape({
  name: Yup.string().required('Customer Name is required'),
  email: Yup.string().email('Enter a valid email'),
  billingEmail: Yup.string().email('Enter a valid email'),
  phone: Yup.string().matches(phoneValidationRE, 'Phone number is not valid'),
  secondaryPhoneNumber: Yup.string().matches(
    phoneValidationRE,
    'Phone number is not valid',
  ),
});

const validationSchemaAddress = Yup.object().shape({
  billingAddress: Yup.object().nullable(),
  beneficiaryAddress: Yup.object().nullable(),
  otherAddress: Yup.object().nullable(),
});

const validationSchemaContactPersons = Yup.object().shape({
  contactPersons: Yup.array().of(
    Yup.object().shape({
      propertyContactPerson: Yup.object().shape({
        roles: Yup.array().of(Yup.string()).min(1, 'Role is required'),
        secondaryPhone: Yup.string().matches(
          phoneValidationRE,
          'Phone number is not valid',
        ),
      }),
      userAccount: Yup.object().shape({
        firstName: Yup.string().required('First name is required'),
        lastName: Yup.string().required('Last name is required'),
        contact: Yup.object().shape({
          email: Yup.string().email('Enter a valid email'),
          phone: Yup.string().matches(
            phoneValidationRE,
            'Phone number is not valid',
          ),
        }),
      }),
    }),
  ),
});

const steps = [
  'Add basic information',
  'Address information',
  'Add contact persons',
];

const localStorageFormikBasicInfoKey = 'NEW_CUSTOMER_formikBasicInfo';
const localStorageFormikAddressKey = 'NEW_CUSTOMER_formikAddress';
const localStorageFormikContactPersonsKey = 'NEW_CUSTOMER_formikContactPersons';

interface Props {
  isDialogOpen: boolean;
  onClose: () => void;
  onSave?: (customerId: string) => void;
  dialogProps?: DialogProps;
}

export const NewCustomer = ({
  isDialogOpen,
  onClose,
  onSave,
  dialogProps,
}: Props) => {
  const {t} = useTranslation();
  const {user} = useUserSession();

  const [activeStep, setActiveStep] = useState(0);
  const [disableNextBtn, setDisableNextBtn] = useState(false);

  const formikBasicInfo = useFormik<CustomerBasicInfoFormModel>({
    initialValues: {
      name: '',
      phone: '',
      secondaryPhoneNumber: '',
      url: '',
      email: '',
      billingEmail: '',
      priority: Priority.NONE,
      externalId: '',
      registrationDate: new Date(),
      costCenter: '',
      vatId: '',
      offsettingAccount: '',
    },
    onSubmit: () => {},
    validationSchema: validationSchemaBasicInfo,
  });

  const formikAddress = useFormik<CustomerAddressFormModel>({
    initialValues: {
      billingAddress: null,
      beneficiaryAddress: null,
      otherAddress: null,
    },
    onSubmit: () => {},
    validationSchema: validationSchemaAddress,
  });

  const formikContactPersons = useFormik<CustomerContactPersonsFormModel>({
    enableReinitialize: true,
    initialValues: {
      contactPersons: [],
    },
    onSubmit: () => {},
    validationSchema: validationSchemaContactPersons,
  });

  const {mutateAsync: createCustomer} = useCreateCustomer(
    'Customer created successfully',
  );
  const {data: customerResource = createEmptyResource<PropertyOwnerView>(50)} =
    useQueryCustomers(
      {
        pageIndex: 0,
        pageSize: 50,
        query: formikBasicInfo.values.externalId
          ? encodeURIComponent(formikBasicInfo.values.externalId!)
          : '',
      },
      {keepPreviousData: true},
    );

  useEffectAfterMount(() => {
    localStorage.setItem(
      localStorageFormikBasicInfoKey,
      JSON.stringify(formikBasicInfo.values),
    );
    localStorage.setItem(
      localStorageFormikAddressKey,
      JSON.stringify(formikAddress.values),
    );
    localStorage.setItem(
      localStorageFormikContactPersonsKey,
      JSON.stringify(formikContactPersons.values),
    );
  }, [
    formikBasicInfo.values,
    formikAddress.values,
    formikContactPersons.values,
  ]);

  useEffect(() => {
    if (
      (activeStep === 0 && Object.keys(formikBasicInfo.errors).length) ||
      (activeStep === 1 && Object.keys(formikAddress.errors).length) ||
      (activeStep === 2 && Object.keys(formikContactPersons.errors).length)
    ) {
      return setDisableNextBtn(true);
    }
    return setDisableNextBtn(false);
  }, [activeStep, formikBasicInfo, formikAddress, formikContactPersons]);

  const addNewEmployee = async () => {
    const body: NewCustomerBody = {
      contact: {
        email: formikBasicInfo.values.email,
        phone: formikBasicInfo.values.phone
          ? formatPhoneNumber(formikBasicInfo.values.phone)
          : '',
        url: formikBasicInfo.values.url,
      },
      externalId: formikBasicInfo.values.externalId,
      name: formikBasicInfo.values.name,
      billingEmail: formikBasicInfo.values.billingEmail,
      priority: formikBasicInfo.values.priority,
      serviceCompanyId: user!.userAccount.serviceCompany.id,
      registrationDate: formikBasicInfo.values.registrationDate,
      costCenter: formikBasicInfo.values.costCenter,
      vatId: formikBasicInfo.values.vatId,
      offsettingAccount: formikBasicInfo.values.offsettingAccount,
      secondaryPhoneNumber: formikBasicInfo.values.secondaryPhoneNumber
        ? formatPhoneNumber(formikBasicInfo.values.secondaryPhoneNumber)
        : '',
      billingAddress: formikAddress.values.billingAddress,
      beneficiaryAddress: formikAddress.values.beneficiaryAddress,
      otherAddress: formikAddress.values.otherAddress,
      contactPersons: formikContactPersons.values.contactPersons,
    };

    const response = await createCustomer(body);

    if (response) {
      onSave?.(response.value);
    }
  };

  return (
    <MuiDialog
      fullWidth
      maxWidth="md"
      open={isDialogOpen}
      onClose={onClose}
      {...dialogProps}>
      <DialogTitle id="alert-dialog-title">{t('Add New Customer')}</DialogTitle>

      <DialogContent>
        <DialogContentText
          component="div"
          sx={{color: 'text.primary', pt: '0.5rem'}}>
          <Stepper
            handleCancel={onClose}
            handleSubmit={addNewEmployee}
            disableNextBtn={disableNextBtn}
            initialActiveStep={0}
            stepperStyles={{width: '80%'}}
            getActiveStep={(val) => {
              if (
                val === 1 &&
                !formikAddress.values.billingAddress?.component?.name
              ) {
                formikAddress.setFieldValue('billingAddress', {
                  ...formikAddress.values.billingAddress,
                  component: {
                    ...formikAddress.values.billingAddress?.component,
                    name: formikBasicInfo.values.name,
                  },
                });
              }
              setActiveStep(val);
            }}
            steps={steps}
            containerStyles={{
              flexGrow: 1,
              ml: '0',
              display: 'flex',
              flexDirection: 'column',
            }}
            disableNavigateBack>
            <FlexContainer>
              {activeStep === 0 ? (
                <FlexContainer containerStyle={{mt: '2em'}}>
                  <BasicCustomerForm
                    formik={formikBasicInfo}
                    customerResource={customerResource.data}
                  />
                </FlexContainer>
              ) : activeStep === 1 ? (
                <FlexContainer containerStyle={{mt: '2em'}}>
                  <CustomerAddressForm formik={formikAddress} />
                </FlexContainer>
              ) : activeStep === 2 ? (
                <FlexContainer containerStyle={{mt: '2em'}}>
                  <CustomerContactPersonsForm formik={formikContactPersons} />
                </FlexContainer>
              ) : null}
            </FlexContainer>
          </Stepper>
        </DialogContentText>
      </DialogContent>
    </MuiDialog>
  );
};

export default NewCustomer;
