import {FlexContainer} from 'components/FlexContainer';
import {FileWithPreview} from 'components/MyDropZone/MyDropzone';
import {PageCard} from 'components/PageCard';
import {Stepper} from 'components/Stepper';
import {useFormik} from 'formik';
import {
  useCreateContract,
  useQueryContract,
} from 'hooks/reactQuery/useContract';
import {useUploadFiles} from 'hooks/reactQuery/useUploadSignedUrl';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {useUuid} from 'hooks/reactQuery/useUuid';
import {
  ContractBasicInfoFormModel,
  ContractOrderField,
  ContractTermsFormModal,
  ContractTypes,
  ContractView,
} from 'models/contract';
import {PropertyOwnerView} from 'models/propertyManager';
import {Order} from 'models/misc';
import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {amountRecordForBackend, useCurrentCurrency} from 'utils/currency';
import {toRestDate} from 'utils/datetime';
import {createEmptyResource} from 'utils/paging-utils';
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
  propertyOwnerId: Yup.string()
    .transform((id) => (id.length > 0 ? id : null))
    .required(
      "Please select an existing customer. To add a new one, go to the 'Customers' section",
    ),
  name: Yup.string().required('Contract name is required'),
  startDate: Yup.date().nullable().required('Start date is required'),
  endDate: Yup.date()
    .default(null)
    .when('startDate', (startDate, schema) => {
      if (startDate) {
        const dayAfter = new Date(startDate.getTime() + 86400000);

        return schema.min(dayAfter, 'End date has to be after than start date');
      }

      return schema;
    })
    .nullable()
    .required('End date is required'),
});

const validationSchemaContractTerms = Yup.object().shape({
  visitsNumber: Yup.number()
    .nullable()
    .min(0, 'Should not be less than 0')
    .required('Visit number is required'),
  invoiceCycle: Yup.string().required('Invoice cycle is required'),
  netAmount: Yup.number()
    .nullable()
    .min(1, 'Should be higher than 0')
    .required('Yearly Contract Price is required'),
  renewalTerms: Yup.number().min(0, 'Should be higher or equals to 0'),
  spendingLimit: Yup.number().min(0, 'Should be higher or equals to 0'),
  annualPriceAdjustmentPercentage: Yup.number().min(
    0,
    'Should be higher or equals to 0',
  ),
  serviceLevelAgreement: Yup.number().min(0, 'Should be higher or equals to 0'),
});

const NewContract = () => {
  const currentCurrency = useCurrentCurrency();
  const [activeStep, setActiveStep] = useState(0);
  const [disableNextBtn, setDisableNextBtn] = useState(false);

  const [customer, setCustomer] = useState<PropertyOwnerView>();

  const navigate = useNavigate();

  const {user} = useUserSession();
  const serviceCompanyId = user?.userAccount.serviceCompany.id;

  const {mutateAsync: uploadFiles, isLoading: isUploading} = useUploadFiles(
    'Documents uploaded successfully',
  );

  const {mutateAsync: createContract, isLoading} = useCreateContract(
    'Contract is created',
  );

  const {data: uuid} = useUuid();

  const [contractTypePass, setContractTypePass] = useState<ContractTypes>();

  const formikBasicInfo = useFormik<ContractBasicInfoFormModel>({
    initialValues: {
      propertyOwnerId: '',
      startDate: null,
      endDate: null,
      name: '',
      externalId: '',
      description: '',
    },
    validateOnMount: true,

    onSubmit: () => {},
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
      visitsNumber: '',
      invoiceCycle: '',
      netAmount: '',
      renewalTerms: '',
      spendingLimit: '',
      annualPriceAdjustmentPercentage: '',
      serviceLevelAgreement: '',
      invoiceDueDays: 0,
      discounts: [{days: 0, discountPercentage: 0}],
      noticePeriodInMonth: 0,
      paymentTermId: '',
    },
    onSubmit: () => {},
    validationSchema: validationSchemaContractTerms,
    validateOnMount: true,
  });

  const formikDocuments = useFormik<{documents: FileWithPreview[]}>({
    initialValues: {
      documents: [],
    },
    onSubmit: () => {},
  });

  const {data: contractResource = createEmptyResource<ContractView>(50)} =
    useQueryContract(
      {
        pageIndex: 0,
        pageSize: 50,
        query: formikBasicInfo.values.externalId,
        order: Order.DESC,
        orderBy: ContractOrderField.CREATED_TIME,
      },
      {keepPreviousData: true},
    );

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
    const contractNameType =
      user?.userAccount?.serviceCompany?.settings?.contractNameTypes.find(
        (item) => item.name === formikBasicInfo.values.name,
      );

    const uploadPath = `${serviceCompanyId}/contracts/${contractId}/documents`;
    const newContract = {
      id: contractId,
      annualPriceAdjustmentPercentage:
        formikContractTerms.values.annualPriceAdjustmentPercentage,
      currency: currentCurrency.code,
      documents: formikDocuments.values.documents.reduce<FileWithPreview[]>(
        (newArr: FileWithPreview[], obj) => [
          ...newArr,
          {
            ...obj,
            type: obj.type,
            uri: `${uploadPath}/${obj.name}`,
            description: obj.name.split('.')[0],
          },
        ],
        [],
      ),
      elevators: formikUnits.values.elevators,
      endDate: toRestDate(formikBasicInfo.values.endDate!),
      invoiceCycle: formikContractTerms.values.invoiceCycle,
      price: amountRecordForBackend({
        currency: currentCurrency.code,
        netAmount: +formikContractTerms.values.netAmount,
        percentageVat:
          +formikContractTerms.values.annualPriceAdjustmentPercentage,
      }),
      sla: +formikContractTerms.values.serviceLevelAgreement,
      propertyOwnerId: formikBasicInfo.values.propertyOwnerId,
      renewalTerms: +formikContractTerms.values.renewalTerms,
      serviceCompanyId,
      spendingLimit: +formikContractTerms.values.spendingLimit,
      startDate: toRestDate(formikBasicInfo.values.startDate!),
      name: contractNameType?.name,
      type: contractNameType?.type,
      visitsNumber: +formikContractTerms.values.visitsNumber,
      timePreference: [],
      firstMaintenance: formikContractTerms.values.firstMaintenance,
      firstInvoiceDate: formikContractTerms.values.firstInvoiceDate,
      invoiceDueDays: formikContractTerms.values.invoiceDueDays,
      discounts: formikContractTerms.values.discounts,
      noticePeriodInMonth: formikContractTerms.values.noticePeriodInMonth,
      paymentTermId: formikContractTerms.values.paymentTermId,
      externalId: formikBasicInfo.values.externalId,
      description: formikBasicInfo.values.description,
    };

    await createContract(newContract);
    if (formikDocuments.values.documents.length) {
      await uploadFiles({files: formikDocuments.values.documents, uploadPath});
    }
    navigate(`/contracts/details/${contractId}`, {replace: true});
  };

  useEffect(() => {
    setContractTypePass(
      user?.userAccount?.serviceCompany?.settings?.contractNameTypes.find(
        (item) => item.name === formikBasicInfo.values.name,
      )?.type!,
    );
  }, [formikBasicInfo]);

  return (
    <Stepper
      handleCancel={handleCancel}
      handleSubmit={handleSubmit}
      getActiveStep={(val) => setActiveStep(val)}
      disableNextBtn={disableNextBtn || isLoading || isUploading}
      steps={steps}
      stepperStyles={{width: '100%'}}
      submitting={isLoading || isUploading}
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
              <NewContractBasicInfo
                formik={formikBasicInfo}
                getCustomer={(item) => setCustomer(item)}
                initialCustomer={customer}
                contractResource={contractResource.data}
              />
            </PageCard>
          </FlexContainer>
        )}
        {activeStep === 1 && (
          <FlexContainer containerStyle={{mt: '2em'}}>
            <NewContractSelectUnits
              formik={formikUnits}
              customerId={formikBasicInfo.values.propertyOwnerId}
            />
          </FlexContainer>
        )}
        {activeStep === 2 && (
          <FlexContainer containerStyle={{mt: '2em'}}>
            <PageCard
              headerLabel="Contract Terms"
              minHeight="100%"
              contentContainerStyles={{height: '100%'}}>
              <NewContractTerms
                formik={formikContractTerms}
                contractTypePass={contractTypePass!}
              />
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
