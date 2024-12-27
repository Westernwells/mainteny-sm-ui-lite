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
  ContractCustomizeContractFormModel,
  ContractOrderField,
  ContractRequestBody,
  ContractTypes,
  ContractView,
  convertExtendedRecordsToContractComponentRecords,
  ExtendedContractComponentRecord,
} from 'models/contract';
import {PropertyOwnerView} from 'models/propertyManager';
import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useCurrentCurrency} from 'utils/currency';
import {toRestDate} from 'utils/datetime';
import * as Yup from 'yup';
import {createEmptyResource} from 'utils/paging';
import {Box, Typography} from '@mui/material';
import {theme} from 'theme';
import {useTranslation} from 'react-i18next';
import NewContractBasicInfo from './NewContractBasicInfo';
import NewContractDocuments from './NewContractDocuments';
import NewContractSelectUnits from './NewContractSelectUnits';
import {NewContractCustomer} from './NewContractCustomer';
import {NewContractServices} from './NewContractServices';
import NewCustomizeContract from './NewCustomizeContract';
import {Order} from '../../models/pagination';

const steps = [
  'Select customer',
  'Add basic information',
  'Include units',
  'Add Services',
  'Customize Contract',
  'Attach documents',
];

const isExternalIdUnique = async (
  contractResource: ContractView[],
  value?: string,
) => {
  if (!value) {
    return true;
  }

  try {
    return !(
      contractResource &&
      contractResource.some((item) => item.externalId === value)
    );
  } catch (error) {
    console.error('Error checking externalId uniqueness:', error);
    return true;
  }
};

const NewContract = () => {
  const {t} = useTranslation();
  const currentCurrency = useCurrentCurrency();
  const [activeStep, setActiveStep] = useState(0);
  const [disableNextBtn, setDisableNextBtn] = useState(false);
  const [externalId, setExternalId] = useState('');

  const [customer, setCustomer] = useState<PropertyOwnerView>();

  const navigate = useNavigate();

  const {data: contractResource = createEmptyResource<ContractView>(50)} =
    useQueryContract(
      {
        pageIndex: 0,
        pageSize: 50,
        query: externalId,
        order: Order.DESC,
        orderBy: ContractOrderField.CREATED_TIME,
      },
      {keepPreviousData: true},
    );

  const validationSchemaBasicInfo = Yup.object().shape({
    name: Yup.string().required('Contract name is required'),
    startDate: Yup.date()
      .nullable()
      .typeError('Please enter a valid date')
      .required('Start date is required'),
    endDate: Yup.date()
      .nullable()
      .typeError('Please enter a valid date')
      .when('startDate', (startDate, schema) => {
        if (
          startDate &&
          startDate instanceof Date &&
          startDate.toString() !== 'Invalid Date'
        ) {
          const dayAfter = new Date(startDate.getTime() + 86400000);
          return schema.min(
            dayAfter,
            'End date has to be after than start date',
          );
        }
        return schema;
      })
      .required('End date is required'),
    externalId: Yup.string().test(
      'checkExternalId',
      'This ID is already taken. Please enter a different one.',
      async (value) => isExternalIdUnique(contractResource.data, value),
    ),
  });

  const {user} = useUserSession();
  const serviceCompanyId = user?.userAccount.serviceCompany.id;

  const {mutateAsync: uploadFiles, isLoading: isUploading} = useUploadFiles(
    'Documents uploaded successfully',
  );

  const {mutateAsync: createContract, isLoading} = useCreateContract(
    'Contract is created',
  );

  const {data: uuid} = useUuid();

  const formikBasicInfo = useFormik<ContractBasicInfoFormModel>({
    initialValues: {
      startDate: null,
      endDate: null,
      name: '',
      externalId: '',
      description: '',
      purchaseOrderNumber: '',
    },
    validateOnMount: true,
    onSubmit: () => {},
    validationSchema: validationSchemaBasicInfo,
  });

  useEffect(() => {
    setExternalId(formikBasicInfo.values.externalId);
  }, [formikBasicInfo]);

  const formikUnits = useFormik<{elevators: string[]}>({
    initialValues: {
      elevators: [],
    },
    onSubmit: () => {},
  });

  const formikCustomizeContract = useFormik<ContractCustomizeContractFormModel>(
    {
      initialValues: {
        renewalTerms: 0,
        noticePeriodInMonth: 0,
        spendingLimit: 0,
        annualPriceAdjustmentPercentage: 0,
        autoRenewalCancelled: false,
      },
      onSubmit: () => {},
      validateOnMount: true,
    },
  );

  const formikDocuments = useFormik<{documents: FileWithPreview[]}>({
    initialValues: {
      documents: [],
    },
    onSubmit: () => {},
  });

  const formikContractComponents = useFormik<{
    components: ExtendedContractComponentRecord[];
  }>({
    initialValues: {
      components: [],
    },
    onSubmit: () => {},
    validateOnMount: true,
  });

  useEffect(() => {
    if (
      (activeStep === 0 && !customer?.id) ||
      (activeStep === 1 && Object.keys(formikBasicInfo.errors).length) ||
      (activeStep === 2 && Object.keys(formikUnits.errors).length) ||
      (activeStep === 3 &&
        formikContractComponents.values.components.length === 0) ||
      (activeStep === 4 &&
        Object.keys(formikCustomizeContract.errors).length) ||
      (activeStep === 5 && Object.keys(formikDocuments.errors).length)
    ) {
      return setDisableNextBtn(true);
    }
    return setDisableNextBtn(false);
  }, [
    activeStep,
    formikDocuments,
    formikUnits,
    formikBasicInfo,
    formikContractComponents,
  ]);

  const handleCancel = () => {
    setActiveStep(0);
  };

  const handleSubmit = async () => {
    const contractId = uuid;

    const uploadPath = `${serviceCompanyId}/contracts/${contractId}/documents`;
    const newContract: ContractRequestBody = {
      type: ContractTypes.SERVICE,
      id: contractId,
      propertyOwnerId: customer?.id!,
      serviceCompanyId: serviceCompanyId!,
      elevators: formikUnits.values.elevators,
      currency: currentCurrency.code,
      endDate: toRestDate(formikBasicInfo.values.endDate!),
      startDate: toRestDate(formikBasicInfo.values.startDate!),
      name: formikBasicInfo.values.name,
      externalId: formikBasicInfo.values.externalId,
      renewalTerms: formikCustomizeContract.values.autoRenewalCancelled
        ? 0
        : +formikCustomizeContract.values.renewalTerms,
      spendingLimit: +formikCustomizeContract.values.spendingLimit,
      annualPriceAdjustmentPercentage:
        formikCustomizeContract.values.annualPriceAdjustmentPercentage,
      noticePeriodInMonth: formikCustomizeContract.values.noticePeriodInMonth,
      autoRenewalCancelled: formikCustomizeContract.values.autoRenewalCancelled,
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
      description: formikBasicInfo.values.description,
      components: convertExtendedRecordsToContractComponentRecords(
        formikContractComponents.values.components,
      ),
      purchaseOrderNumber: formikBasicInfo.values.purchaseOrderNumber,
    };

    await createContract(newContract);
    if (formikDocuments.values.documents.length) {
      await uploadFiles({files: formikDocuments.values.documents, uploadPath});
    }
    navigate(`/contracts/details/${contractId}`, {replace: true});
  };

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
      }}
      stepperNavigationStyles={{
        position: 'fixed',
        bottom: 0,
        left: '0%',
        width: '100%',
        padding: '1em 1.5% 1em 6%',
      }}>
      <FlexContainer>
        {activeStep === 0 && (
          <FlexContainer containerStyle={{mt: '1em'}}>
            <PageCard
              headerLabel="Select customer to add new contract"
              minHeight="78%">
              <NewContractCustomer
                initialSelectedCustomer={customer}
                getSelectedCustomer={(item) => setCustomer(item)}
              />
            </PageCard>
          </FlexContainer>
        )}
        {activeStep === 1 && (
          <FlexContainer containerStyle={{mt: '1em'}}>
            <PageCard headerLabel="Basic Information" minHeight="65%">
              <NewContractBasicInfo formik={formikBasicInfo} />
            </PageCard>
          </FlexContainer>
        )}
        {activeStep === 2 && (
          <FlexContainer containerStyle={{mt: '1em'}}>
            <PageCard
              headerLabel="Include Units in the Contract"
              minHeight="85%">
              <NewContractSelectUnits
                formik={formikUnits}
                customerId={customer?.id!}
              />
            </PageCard>
          </FlexContainer>
        )}

        {activeStep === 3 && (
          <FlexContainer containerStyle={{mt: '1em'}}>
            <PageCard
              headerLabel="Add Services"
              containerStyles={{
                maxHeight: '75vh',
                overflowY: 'auto',
                minHeight: '75vh',
              }}
              contentContainerStyles={{height: '100%', textAlign: 'left'}}>
              <NewContractServices
                elevatorUnits={formikUnits.values.elevators}
                formik={formikContractComponents}
                initialSelectedCustomer={customer}
                getSelectedCustomer={(item) => setCustomer(item)}
              />
            </PageCard>
          </FlexContainer>
        )}
        {activeStep === 4 && (
          <FlexContainer containerStyle={{mt: '1em'}}>
            <PageCard
              headerLabel="Customize Contract"
              containerStyles={{
                maxHeight: '74vh',
                overflowY: 'auto',
                minHeight: '75vh',
              }}
              contentContainerStyles={{height: '100%'}}>
              <NewCustomizeContract
                formik={formikCustomizeContract}
                formikContractComponents={formikContractComponents}
              />
            </PageCard>
          </FlexContainer>
        )}

        {activeStep === 5 && (
          <FlexContainer containerStyle={{mt: '1em'}}>
            <PageCard
              headerLabel="Documents"
              contentContainerStyles={{height: '100%'}}>
              <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                <Typography
                  variant="body1"
                  color={theme.palette.text.secondary}
                  pb={5}>
                  {t(
                    'Upload documents associated with the contract to ensure comprehensive and well-documented record.',
                  )}
                </Typography>
              </Box>
              <NewContractDocuments formik={formikDocuments} />
            </PageCard>
          </FlexContainer>
        )}
      </FlexContainer>
    </Stepper>
  );
};

export default NewContract;
