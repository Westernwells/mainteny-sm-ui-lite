import {FlexContainer} from 'components/FlexContainer';
import {FileWithPreview} from 'components/MyDropzone';
import {PageCard} from 'components/PageCard';
import {Stepper} from 'components/Stepper';
import {useFormik} from 'formik';
import {useCreateContract} from 'hooks/reactQuery/useContract';
import {useUploadFiles} from 'hooks/reactQuery/useUploadSignedUrl';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {useUuid} from 'hooks/reactQuery/useUuid';
import {
  ContractBasicInfoFormModel,
  ContractTermsFormModal,
} from 'models/contract';
import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router';
import {convertToMacro} from 'utils/utils';
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
  propertyOwner: Yup.object().shape({
    id: Yup.string().required('Customer is required'),
  }),
  contractType: Yup.string().nullable().required('Contract Type is required'),
  contractNumber: Yup.number()
    .nullable()
    .min(0, 'Should be higher or equal to 0'),
  externalId: Yup.string().nullable().required('Contract Number is required'),
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
  renewalTerms: Yup.number().min(0, 'Should be higher than 0'),
  spendingLimit: Yup.number().min(0, 'Should be higher or equals to 0'),
  hourlyRate: Yup.number().min(0, 'Should be higher or equals to 0'),
  annualPriceAdjustmentPercentage: Yup.number().min(
    0,
    'Should be higher or equals to 0',
  ),
  serviceLevelAgreement: Yup.number().min(0, 'Should be higher or equals to 0'),
});

const NewContract = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [disableNextBtn, setDisableNextBtn] = useState(false);

  const navigate = useNavigate();

  const {user} = useUserSession();
  const serviceCompanyId = user?.userAccount.serviceCompany.id;

  const {mutateAsync: uploadFiles} = useUploadFiles(
    'Documents uploaded successfully',
  );

  const {mutateAsync: createContract, isLoading} = useCreateContract(
    'Contract is created',
  );

  const {data: uuid} = useUuid();

  const formikBasicInfo = useFormik<ContractBasicInfoFormModel>({
    initialValues: {
      propertyOwner: null,
      startDate: '',
      endDate: '',
      contractType: '',
      externalId: '',
    },
    onSubmit: () => {},
    validateOnMount: true,
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
      renewalTerms: 0,
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
    const contractId = uuid;

    const uploadPath = `${serviceCompanyId}/contracts/${contractId}/documents`;
    const newContract = {
      id: contractId,
      annualPriceAdjustmentPercentage:
        formikContractTerms.values.annualPriceAdjustmentPercentage,
      currency: 'EUR',
      documents: formikDocuments.values.documents.reduce<FileWithPreview[]>(
        (newArr: FileWithPreview[], obj) => [
          ...newArr,
          {
            ...obj,
            type: obj.type,
            uri: `${uploadPath}/${obj.name}`,
            description: '',
          },
        ],
        [],
      ),
      elevators: formikUnits.values.elevators,
      endDate: formikBasicInfo.values.endDate,
      hourlyRate: formikContractTerms.values.hourlyRate,
      invoiceDue: convertToMacro(formikContractTerms.values.invoiceDue),
      price: {
        currency: 'EUR',
        netAmount: formikContractTerms.values.netAmount,
        percentageVat:
          formikContractTerms.values.annualPriceAdjustmentPercentage,
      },
      sla: formikContractTerms.values.serviceLevelAgreement,
      propertyOwnerId: formikBasicInfo.values.propertyOwner?.id,
      renewalTerms: formikContractTerms.values.renewalTerms,
      serviceCompanyId,
      spendingLimit: formikContractTerms.values.spendingLimit,
      startDate: formikBasicInfo.values.startDate,
      type: convertToMacro(formikBasicInfo.values.contractType),
      visitsNumber: formikContractTerms.values.visitsNumber,
      timePreference: [],
      externalId: formikBasicInfo.values.externalId,
    };

    await createContract(newContract);
    await uploadFiles({files: formikDocuments.values.documents, uploadPath});

    navigate('/contracts');
  };

  return (
    <Stepper
      handleCancel={handleCancel}
      handleSubmit={handleSubmit}
      getActiveStep={(val) => setActiveStep(val)}
      disableNextBtn={disableNextBtn}
      steps={steps}
      stepperStyles={{width: '100%'}}
      submitting={isLoading}
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
              <NewContractSelectUnits
                formik={formikUnits}
                customerId={formikBasicInfo.values.propertyOwner!.id}
              />
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
