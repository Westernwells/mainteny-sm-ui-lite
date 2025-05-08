import {useEffect, useLayoutEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {isEqual, omit} from 'lodash';
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
import {applyCountryCode, formatAddressFullname} from 'utils/utils';
import {AddressRecord} from 'models/misc';
import {useCompanyById} from 'hooks/reactQuery/useCompanies';
import {useTranslation} from 'react-i18next';
import {CustomTranslationOptions} from 'pages/CompanyDetails/BasicInformation';

import {companyLanguageContextMap} from 'utils/language';
import {
  CustomerAddressFormModel,
  CustomerBasicInfoFormModel,
  CustomerContactPersonsFormModel,
  NewCustomerBody,
} from './model';
import {BasicCustomerForm} from './BasicCustomerForm';
import {CustomerAddressForm} from './CustomerAddressForm';
import {CustomerContactPersonsForm} from './CustomerContactPersonsForm';
import {ConfirmCancel} from './ConfirmCancel';
import {ResumeProgress} from './ResumeProgress';

interface Props {
  getCurrentPageTitle?: (title: string) => void;
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

const steps = [
  'Add basic information',
  'Address information',
  'Add contact persons',
];

const localStorageFormikBasicInfoKey = 'NEW_CUSTOMER_formikBasicInfo';
const localStorageFormikAddressKey = 'NEW_CUSTOMER_formikAddress';
const localStorageFormikContactPersonsKey = 'NEW_CUSTOMER_formikContactPersons';

export const NewCustomer = ({getCurrentPageTitle}: Props) => {
  const navigate = useNavigate();
  const {user} = useUserSession();
  const {data: companyInfo} = useCompanyById(
    user?.userAccount.serviceCompany.id,
  );
  const {t: translateCompanyLanguage} = useTranslation('translation', {
    lng: companyLanguageContextMap[companyInfo?.language as string],
  } as CustomTranslationOptions);
  const [activeStep, setActiveStep] = useState(0);
  const [disableNextBtn, setDisableNextBtn] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openResumeProgressDialog, setOpenResumeProgressDialog] =
    useState(false);
  const [externalId, setExternalId] = useState('');

  const {data: customerResource = createEmptyResource<PropertyOwnerView>(50)} =
    useQueryCustomers(
      {
        pageIndex: 0,
        pageSize: 50,
        query: externalId,
      },
      {keepPreviousData: true},
    );

  const validationSchemaBasicInfo = Yup.object().shape({
    name: Yup.string().required('Customer Name is required'),
    email: Yup.string().email('Enter a valid email'),
    billingEmail: Yup.string().email('Enter a valid email'),
    phone: Yup.string().matches(phoneValidationRE, 'Phone number is not valid'),
    secondaryPhoneNumber: Yup.string().matches(
      phoneValidationRE,
      'Phone number is not valid',
    ),
    externalId: Yup.string()
      .required('Customer Number is required')
      .test(
        'checkExternalId',
        'This ID is already taken. Please enter a different one.',
        async (value) => isExternalIdUnique(customerResource.data, value),
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

  const {mutateAsync: createCustomer} = useCreateCustomer(
    'Customer created successfully',
  );

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
      vat: '',
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

  useEffectAfterMount(() => {
    if (!openResumeProgressDialog) {
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
    }
  }, [
    formikBasicInfo.values,
    formikAddress.values,
    formikContactPersons.values,
    openResumeProgressDialog,
  ]);

  useEffect(() => {
    setExternalId(formikBasicInfo.values.externalId);
  }, [formikBasicInfo]);

  // show resume progress modal if there's previous stored state in local storage
  useEffect(() => {
    const localStorageFormikBasicInfo = localStorage.getItem(
      localStorageFormikBasicInfoKey,
    );

    const localStorageFormikBasicInfoParsed = JSON.parse(
      localStorageFormikBasicInfo ?? '{}',
    ) as CustomerBasicInfoFormModel;

    const fieldsToIgnore = ['registrationDate', 'externalId'];
    if (
      localStorageFormikBasicInfo &&
      !isEqual(
        omit(localStorageFormikBasicInfoParsed, fieldsToIgnore),
        omit(formikBasicInfo.values, fieldsToIgnore),
      )
    ) {
      setOpenResumeProgressDialog(true);
    }
  }, []);

  useLayoutEffect(() => {
    if (getCurrentPageTitle) {
      getCurrentPageTitle('New Customer');
    }
  }, []);

  useEffect(() => {
    if (
      (activeStep === 0 && Object.keys(formikBasicInfo.errors).length) ||
      (formikBasicInfo.values.externalId &&
        customerResource.data.filter(
          (item) => item.externalId === formikBasicInfo.values.externalId,
        ).length > 0) ||
      (activeStep === 1 && Object.keys(formikAddress.errors).length) ||
      (activeStep === 2 &&
        formikContactPersons.values.contactPersons.length > 0 &&
        Object.keys(formikContactPersons.errors).length > 0)
    ) {
      return setDisableNextBtn(true);
    }
    return setDisableNextBtn(false);
  }, [activeStep, formikBasicInfo, formikAddress, formikContactPersons]);

  const restoreFormikFromLocalStorage = () => {
    const localStorageFormikBasicInfo = localStorage.getItem(
      localStorageFormikBasicInfoKey,
    );
    const localStorageFormikAddress = localStorage.getItem(
      localStorageFormikAddressKey,
    );
    const localStorageFormikContactPersons = localStorage.getItem(
      localStorageFormikContactPersonsKey,
    );
    if (localStorageFormikBasicInfo) {
      formikBasicInfo.setValues(JSON.parse(localStorageFormikBasicInfo!));
    }
    if (localStorageFormikAddress) {
      formikAddress.setValues(JSON.parse(localStorageFormikAddress!));
    }
    if (localStorageFormikContactPersons) {
      formikContactPersons.setValues(
        JSON.parse(localStorageFormikContactPersons!),
      );
    }
    setOpenResumeProgressDialog(false);
  };

  const resetLocalStorage = () => {
    [
      localStorageFormikBasicInfoKey,
      localStorageFormikAddressKey,
      localStorageFormikContactPersonsKey,
    ].forEach((key) => {
      localStorage.removeItem(key);
    });
    setOpenResumeProgressDialog(false);
  };

  const handleCancel = () => {
    setOpenDialog(true);
  };

  const onCancel = () => {
    resetLocalStorage();
    navigate(-1);
  };

  const addNewPropertyOwner = async () => {
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
      billingAddress: applyCountryCode(
        formatAddressFullname(
          formikAddress.values.billingAddress,
          translateCompanyLanguage,
        ),
      ) as AddressRecord | null,
      beneficiaryAddress: applyCountryCode(
        formatAddressFullname(
          formikAddress.values.beneficiaryAddress,
          translateCompanyLanguage,
        ),
      ) as AddressRecord | null,
      otherAddress: applyCountryCode(
        formatAddressFullname(
          formikAddress.values.otherAddress,
          translateCompanyLanguage,
        ),
      ) as AddressRecord | null,
      contactPersons: formikContactPersons.values.contactPersons,
      buyerReference: formikBasicInfo.values.buyerReference,
      invoiceFormat: formikBasicInfo.values.invoiceFormat,
      vat: formikBasicInfo.values.vat,
    };

    const response = await createCustomer(body);

    if (response) {
      resetLocalStorage();
      navigate(`/customers/details/${response.value}?tab=0`, {replace: true});
    }
  };

  return (
    <Stepper
      handleCancel={handleCancel}
      handleSubmit={addNewPropertyOwner}
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
        overflowY: 'hidden',
      }}>
      <FlexContainer containerStyle={{overflowY: 'hidden'}}>
        {activeStep === 0 ? (
          <FlexContainer containerStyle={{mt: '2em'}}>
            <BasicCustomerForm formik={formikBasicInfo} />
          </FlexContainer>
        ) : activeStep === 1 ? (
          <FlexContainer containerStyle={{mt: '2em', overflowY: 'hidden'}}>
            <CustomerAddressForm formik={formikAddress} />
          </FlexContainer>
        ) : activeStep === 2 ? (
          <FlexContainer containerStyle={{mt: '2em'}}>
            <CustomerContactPersonsForm formik={formikContactPersons} />
          </FlexContainer>
        ) : null}
      </FlexContainer>
      <ConfirmCancel
        open={openDialog}
        onConfirm={onCancel}
        onClose={() => setOpenDialog(false)}
      />
      <ResumeProgress
        open={openResumeProgressDialog}
        onConfirm={restoreFormikFromLocalStorage}
        onClose={resetLocalStorage}
      />
    </Stepper>
  );
};

export default NewCustomer;
