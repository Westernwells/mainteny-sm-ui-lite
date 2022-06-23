import {FlexContainer} from 'components/FlexContainer';
import {FileWithPreview} from 'components/MyDropzone';
import {PageCard} from 'components/PageCard';
import {Stepper} from 'components/Stepper';
import {useFormik} from 'formik';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {
  ContractBasicInfoFormModel,
  ContractTermsFormModal,
} from 'models/contract';
import React, {useEffect, useState} from 'react';
import * as Yup from 'yup';
import NewContractBasicInfo from './NewContractBasicInfo';
import NewContractDocuments from './NewContractDocuments';
import NewContractSelectUnits from './NewContractSelectUnits';
import NewContractTerms from './NewContractTerms';

const steps = [
  'Add basic info',
  'Select units',
  'Add contract terms',
  'Attach documents',
];

const validationSchemaBasicInfo = Yup.object().shape({
  propertyOwnerId: Yup.string().nullable().required('Customer is required'),
  startDate: Yup.string().nullable().required('Start date is required'),
  endDate: Yup.string().nullable().required('End date is required'),
  contractType: Yup.string().nullable().required('Contract Type is required'),
  contractNumber: Yup.number()
    .nullable()
    .min(0, 'Should be higher or equal to 0'),
});

const validationSchemaContractTerms = Yup.object().shape({
  visitsNumber: Yup.number()
    .nullable()
    .required('Customer is required')
    .min(1, 'Should be higher than 0'),
  invoiceDue: Yup.string()
    .nullable()
    .required('Customer is required')
    .min(1, 'Input should be filled out'),
  netAmount: Yup.number()
    .nullable()
    .required('Customer is required')
    .min(1, 'Should be higher than 0'),
  renewalTerms: Yup.string(),
  spendingLimit: Yup.number(),
  hourlyRate: Yup.number(),
  annualPriceAdjustmentPercentage: Yup.number(),
  serviceLevelAgreement: Yup.number(),
});

const NewContract = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [disableNextBtn, setDisableNextBtn] = useState(false);

  const {user} = useUserSession();
  const serviceCompanyId = user?.userAccount.serviceCompany.id;

  const formikBasicInfo = useFormik<ContractBasicInfoFormModel>({
    initialValues: {
      propertyOwnerId: '',
      startDate: '',
      endDate: '',
      contractType: '',
      contractNumber: 0,
    },
    onSubmit: () => {},
    validateOnChange: true,
    validationSchema: validationSchemaBasicInfo,
  });

  const formikUnits = useFormik<{elevators: string[]}>({
    initialValues: {
      elevators: [],
    },
    onSubmit: () => {},
  });

  const formikContractTerms = useFormik<ContractTermsFormModal>({
    initialValues: {
      visitsNumber: 0,
      invoiceDue: '',
      netAmount: 0,
      renewalTerms: '',
      spendingLimit: 0,
      hourlyRate: 0,
      annualPriceAdjustmentPercentage: 0,
      serviceLevelAgreement: 0,
    },
    onSubmit: () => {},
    validateOnChange: true,
    validateOnMount: true,
    validationSchema: validationSchemaContractTerms,
  });

  const formikDocuments = useFormik<{documents: FileWithPreview[]}>({
    initialValues: {
      documents: [],
    },
    onSubmit: () => {},
  });

  useEffect(() => {
    console.log(
      activeStep,
      formikBasicInfo.errors,
      formikUnits.errors,
      formikContractTerms.errors,
      formikDocuments.errors,
    );
    if (
      (activeStep === 0 && Object.keys(formikBasicInfo.errors).length) ||
      (activeStep === 1 && Object.keys(formikUnits.errors).length) ||
      (activeStep === 2 && Object.keys(formikContractTerms.errors).length) ||
      (activeStep === 3 && Object.keys(formikDocuments.errors).length)
    ) {
      return setDisableNextBtn(true);
    }
    return setDisableNextBtn(false);
  }, [
    activeStep,
    formikDocuments,
    formikContractTerms,
    formikUnits,
    formikBasicInfo,
  ]);

  const handleCancel = () => {
    setActiveStep(0);
  };

  const handleSubmit = async () => {
    const newContract = {
      annualPriceAdjustmentPercentage:
        formikContractTerms.values.annualPriceAdjustmentPercentage,
      currency: 'EUR',
      documents: formikDocuments.values.documents,
      elevators: formikUnits.values.elevators,
      endDate: formikBasicInfo.values.endDate,
      hourlyRate: formikContractTerms.values.hourlyRate,
      invoiceDue: formikContractTerms.values.invoiceDue,
      price: {
        currency: 'EUR',
        netAmount: formikContractTerms.values.netAmount,
        percentageVat:
          formikContractTerms.values.annualPriceAdjustmentPercentage,
      },
      sla: formikContractTerms.values.serviceLevelAgreement,
      propertyOwnerId: formikBasicInfo.values.propertyOwnerId,
      renewalTerms: formikContractTerms.values.renewalTerms,
      serviceCompanyId,
      spendingLimit: formikContractTerms.values.spendingLimit,
      startDate: formikBasicInfo.values.startDate,
      type: formikBasicInfo.values.contractType,
      visitsNumber: formikContractTerms.values.visitsNumber,
    };
    console.log(newContract, '<<< newContract');
  };

  return (
    <Stepper
      handleCancel={handleCancel}
      handleSubmit={handleSubmit}
      getActiveStep={(val) => setActiveStep(val)}
      disableNextBtn={disableNextBtn}
      steps={steps}
      stepperStyles={{width: '100%'}}
      containerStyles={{
        flexGrow: 1,
        ml: '0',
        display: 'flex',
        flexDirection: 'column',
      }}>
      <FlexContainer>
        {activeStep === 0 && (
          <FlexContainer containerStyle={{mt: '2em'}}>
            <PageCard headerLabel="Basic Information" minHeight="100%">
              <NewContractBasicInfo formik={formikBasicInfo} />
            </PageCard>
          </FlexContainer>
        )}
        {activeStep === 1 && (
          <FlexContainer containerStyle={{mt: '2em'}}>
            <PageCard
              headerLabel="Units"
              minHeight="100%"
              contentContainerStyles={{height: '100%'}}>
              <NewContractSelectUnits formik={formikUnits} />
            </PageCard>
          </FlexContainer>
        )}
        {activeStep === 2 && (
          <FlexContainer containerStyle={{mt: '2em'}}>
            <PageCard
              headerLabel="Contract Terms"
              minHeight="100%"
              contentContainerStyles={{height: '100%'}}>
              <NewContractTerms formik={formikContractTerms} />
            </PageCard>
          </FlexContainer>
        )}
        {activeStep === 3 && (
          <FlexContainer containerStyle={{mt: '2em'}}>
            <PageCard
              headerLabel="Documents"
              minHeight="100%"
              contentContainerStyles={{height: '100%'}}>
              <NewContractDocuments formik={formikDocuments} />
            </PageCard>
          </FlexContainer>
        )}
      </FlexContainer>
    </Stepper>
  );
};

export default NewContract;
