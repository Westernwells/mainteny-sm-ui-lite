import {useEffect, useLayoutEffect, useState} from 'react';
import {FormikErrors} from 'formik';
import {useNavigate} from 'react-router';

import {FlexContainer} from 'components/FlexContainer';
import {Stepper} from 'components/Stepper';
import {
  useCreateServiceCompany,
  useUpdateSystemSettings,
} from 'hooks/reactQuery/useCompanies';
import {BasicCompanyForm} from './BasicCompanyForm';
import {
  BasicInformationFormModel,
  CompanyInformationFormModel,
  NewServiceCompanyBody,
  PaymentFormModel,
  SettingsFormModel,
} from './model';
import {PaymentForm} from './PaymentForm';
import {SettingsCompanyForm} from './SettingsCompanyForm';
import {CompanyInformation} from './CompanyInformation';

interface Props {
  getCurrentPageTitle?: (title: string) => void;
}

const steps = [
  'Add basic information',
  'Apply settings',
  'Add payment information',
  'Add company information',
];

export const NewCompany = ({getCurrentPageTitle}: Props) => {
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [disableNextBtn, setDisableNextBtn] = useState(false);

  const [basicCompanyFormError, setBasicCompanyFormError] = useState<
    FormikErrors<BasicInformationFormModel>
  >({});

  const [basicCompanyFormValues, setBasicCompanyFormValues] =
    useState<BasicInformationFormModel>({
      name: '',
      phone: '',
      url: '',
      email: '',
      postalAddress: null,
      billingAddress: null,
      businessAddress: null,
    });

  const [settingsCompanyFormError, setSettingsCompanyFormError] = useState<
    FormikErrors<SettingsFormModel>
  >({});

  const [settingsCompanyFormValues, setSettingsCompanyFormValues] =
    useState<SettingsFormModel>({
      language: '',
      dateFormat: '',
      timeFormat: '',
      timeZone: '',
      companyDispatchStrategy: '',
      nightlyShuffleEnabled: false,
      totalYearlyVacationDaysAllowed: '',
    });

  const [paymentCompanyFormError, setPaymentCompanyFormError] = useState<
    FormikErrors<PaymentFormModel>
  >({});

  const [paymentCompanyFormValues, setPaymentCompanyFormValues] =
    useState<PaymentFormModel>({
      vatId: '',
      percentageVat: '',
      iban: '',
      bic: '',
      accountNumber: '',
    });

  const [companyInformationFormError, setCompanyInformationFormError] =
    useState<FormikErrors<CompanyInformationFormModel>>({});

  const [companyInformationFormValues, setCompanyInformationFormValues] =
    useState<CompanyInformationFormModel>({
      managingDirector: '',
      arbitrationCourt: '',
      tradeRegisterNumber: '',
    });

  useLayoutEffect(() => {
    if (getCurrentPageTitle) {
      getCurrentPageTitle('New Service Company');
    }
  }, []);

  useEffect(() => {
    if (activeStep === 0 && Object.keys(basicCompanyFormError).length) {
      return setDisableNextBtn(true);
    }

    if (activeStep === 1 && Object.keys(settingsCompanyFormError).length) {
      return setDisableNextBtn(true);
    }

    if (activeStep === 2 && Object.keys(paymentCompanyFormError).length) {
      return setDisableNextBtn(true);
    }

    if (activeStep === 3 && Object.keys(companyInformationFormError).length) {
      return setDisableNextBtn(true);
    }

    return setDisableNextBtn(false);
  }, [
    activeStep,
    basicCompanyFormError,
    settingsCompanyFormError,
    paymentCompanyFormError,
    companyInformationFormError,
  ]);

  useEffect(() => {
    setActiveStep(0);
  }, []);

  const handleCancel = () => {
    setActiveStep(0);
  };

  const {mutateAsync: createServiceCompany, isLoading: isSubmitting} =
    useCreateServiceCompany('Service company created successfully');

  const {mutateAsync: updateSystemSettings, isLoading: isSavingSettings} =
    useUpdateSystemSettings('System settings added successfully');

  const addNewCompany = async () => {
    const formattedPhone = basicCompanyFormValues.phone.replaceAll('+', '');
    const body: NewServiceCompanyBody = {
      billingAddress: basicCompanyFormValues.billingAddress,
      businessAddress: basicCompanyFormValues.businessAddress,
      postalAddress: basicCompanyFormValues.postalAddress,
      name: basicCompanyFormValues.name,
      phone: formattedPhone ? `+${formattedPhone}` : '',
      email: basicCompanyFormValues.email,
      url: basicCompanyFormValues.url,

      language: settingsCompanyFormValues.language,
      totalYearlyVacationDaysAllowed:
        Number(settingsCompanyFormValues.totalYearlyVacationDaysAllowed) || 0,
      dateFormat: settingsCompanyFormValues.dateFormat,
      timeFormat: settingsCompanyFormValues.timeFormat,
      paymentInfo: {
        iban: paymentCompanyFormValues.iban,
        bic: paymentCompanyFormValues.bic,
        accountNumber: paymentCompanyFormValues.accountNumber,
      },
      managingDirector: companyInformationFormValues.managingDirector,
      arbitrationCourt: companyInformationFormValues.arbitrationCourt,
      tradeRegisterNumber: companyInformationFormValues.tradeRegisterNumber,
      vatId: paymentCompanyFormValues.vatId,
      percentageVat: Number(paymentCompanyFormValues.percentageVat) || 0,
      timezone: settingsCompanyFormValues.timeZone,
      currencies: [],
    };

    const response = await createServiceCompany(body);

    if (response) {
      await updateSystemSettings({
        body: {
          companyDispatchStrategy:
            settingsCompanyFormValues.companyDispatchStrategy,
          nightlyShuffleEnabled:
            settingsCompanyFormValues.nightlyShuffleEnabled,
        },
        companyId: response.value || '',
      });
      navigate(`/admin/companies/details/${response.value}`, {replace: true});
    }
  };

  return (
    <Stepper
      handleCancel={handleCancel}
      handleSubmit={addNewCompany}
      disableNextBtn={disableNextBtn || isSubmitting || isSavingSettings}
      submitting={isSubmitting}
      initialActiveStep={0}
      stepperStyles={{width: '80%'}}
      getActiveStep={(val) => setActiveStep(val)}
      steps={steps}
      containerStyles={{
        flexGrow: 1,
        ml: '0',
        display: 'flex',
        flexDirection: 'column',
      }}>
      <FlexContainer>
        {activeStep === 0 && (
          <FlexContainer containerStyle={{mt: '2em'}}>
            <BasicCompanyForm
              getBasicCompanyFormErrors={(errors) =>
                setBasicCompanyFormError(errors)
              }
              getBasicCompanyFormValues={(values) =>
                setBasicCompanyFormValues(values)
              }
              initialValues={basicCompanyFormValues}
            />
          </FlexContainer>
        )}
        {activeStep === 1 && (
          <FlexContainer containerStyle={{mt: '2em'}}>
            <SettingsCompanyForm
              getSettingsCompanyFormErrors={(errors) =>
                setSettingsCompanyFormError(errors)
              }
              getSettingsCompanyFormValues={(values) =>
                setSettingsCompanyFormValues(values)
              }
              initialValues={settingsCompanyFormValues}
            />
          </FlexContainer>
        )}
        {activeStep === 2 && (
          <FlexContainer containerStyle={{mt: '2em'}}>
            <PaymentForm
              getPaymentFormErrors={(errors) =>
                setPaymentCompanyFormError(errors)
              }
              getPaymentFormValues={(values) =>
                setPaymentCompanyFormValues(values)
              }
              initialValues={paymentCompanyFormValues}
            />
          </FlexContainer>
        )}
        {activeStep === 3 && (
          <FlexContainer containerStyle={{mt: '2em'}}>
            <CompanyInformation
              getCompanyInformationFormErrors={(errors) =>
                setCompanyInformationFormError(errors)
              }
              getCompanyInformationFormValues={(values) =>
                setCompanyInformationFormValues(values)
              }
              initialValues={companyInformationFormValues}
            />
          </FlexContainer>
        )}
      </FlexContainer>
    </Stepper>
  );
};
