import React, {FC, useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import {
  useQueryContract,
  useUpdateContract,
} from 'hooks/reactQuery/useContract';
import useTheme from '@mui/material/styles/useTheme';
import EditIcon from '@mui/icons-material/Edit';
import {useParams} from 'react-router-dom';
import {useFormik} from 'formik';
import {
  ContractOrderField,
  ContractRequestBody,
  ContractTypes,
  ContractUpdateRequest,
  ContractView,
} from 'models/contract';
import {InfoCard} from 'components/InfoCard';
import {Dialog} from 'components/Dialog';
import {Progress} from 'components/Progress';
import {FileWithPreview} from 'components/MyDropZone/MyDropzone';
import * as Yup from 'yup';
import {
  amountForView,
  amountRecordForBackend,
  formatCurrency,
  useCurrentCurrency,
} from 'utils/currency';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {useUploadFiles} from 'hooks/reactQuery/useUploadSignedUrl';
import {calculateRenewDays} from 'utils/contract-utils';
import {ReactComponent as BusinessContractApprove} from 'assets/icons/business-contract-approve-gray.svg';
import {ReactComponent as TimeIcon} from 'assets/icons/time.svg';
import {Order} from 'models/misc';
import {createEmptyResource} from 'utils/paging-utils';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import MoreIcon from '@mui/icons-material/MoreVert';
import IconButton from '@mui/material/IconButton';
import CancelIcon from '@mui/icons-material/Cancel';
import {UserSession} from 'models/session';
import {ContractBasic} from './ContractBasic';
import {ContractTimeline} from './ContractTimeline';
import {ContractCard} from './ContractCard';
import EditContractForm from './EditContractForm';
import {SectionTitle} from '../../../InvoiceDetails/SectionTitle';
import {CancelContract} from './CancelContract';
import {Parties} from './Parties';
import {AttachDocument} from './AttachDocument';
import {Services} from './Services';
import InvoiceSetup from './InvoiceSetup';

interface Props {
  contractDetails: ContractView;
  isLoading: boolean;
}

const isExternalIdUnique = async (resource: ContractView[], value?: string) => {
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

export const ContractOverview: FC<Props> = ({contractDetails, isLoading}) => {
  const {t} = useTranslation();
  const currentCurrency = useCurrentCurrency();
  const currency = contractDetails?.currency ?? currentCurrency.code;
  const {id: contractId} = useParams();
  const theme = useTheme();
  const {mutateAsync: updateContract, isLoading: isUpdateLoading} =
    useUpdateContract('Contract updated');
  const {user} = useUserSession();

  const [openContractDialog, setOpenContractDialog] = useState(false);
  const [openDocumentDialog, setOpenDocumentDialog] = useState(false);

  const [openCancelContract, setCancelContract] = useState(false);
  const [cancellationDate, setCancellationDate] = useState(
    contractDetails?.end || '',
  );

  const [documents, setDocuments] = useState<FileWithPreview[]>([]);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const {mutateAsync: uploadFiles, isLoading: isUploadLoading} = useUploadFiles(
    'Documents uploaded successfully',
  );

  const {data: downloadUrls = {}} = useDownloadUrl(
    contractDetails?.additionalInfo?.documents
      ? contractDetails.additionalInfo.documents.map((item) => item.uri)
      : [],
  );

  const [initValue, setInitValue] = useState('');
  const [updatedValue, setUpdatedValue] = useState('');

  const {data: contractResource = createEmptyResource<ContractView>(50)} =
    useQueryContract(
      {
        pageIndex: 0,
        pageSize: 50,
        query: updatedValue ?? '',
        order: Order.DESC,
        orderBy: ContractOrderField.CREATED_TIME,
      },
      {keepPreviousData: true},
    );
  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Contract name is required'),
    renewalTerms: Yup.number()
      .min(0, 'Renewal period must be between 0-12 months')
      .max(12, 'Renewal period must be between 0-12 months'),
    discounts: Yup.number().min(0, 'Discount can not be less than 0'),
    externalId: Yup.string().test(
      'checkExternalId',
      'This ID is already taken. Please enter a different one.',
      async (value) => {
        if (value !== initValue) {
          return isExternalIdUnique(contractResource.data, value);
        }
        return true;
      },
    ),
  });

  const formik = useFormik<ContractUpdateRequest>({
    initialValues: {
      type: contractDetails?.type!,
      name: contractDetails?.name!,
      price: contractDetails?.additionalInfo?.price
        ? amountForView(contractDetails?.additionalInfo?.price).netAmount
        : '',
      invoiceCycle: contractDetails?.additionalInfo?.invoiceCycle!,
      renewalTerms: contractDetails?.additionalInfo?.renewalTerms || '',
      visitsNumber: contractDetails?.visitsNumber || '',
      spendingLimit: contractDetails?.spendingLimit || '',
      invoiceDueDays: contractDetails?.additionalInfo?.invoiceDueDays,
      annualPriceAdjustmentPercentage:
        contractDetails?.additionalInfo?.annualPriceAdjustmentPercentage,
      discounts:
        contractDetails?.additionalInfo &&
        contractDetails?.additionalInfo?.discounts &&
        contractDetails?.additionalInfo?.discounts[0].discountPercentage,
      noticePeriodInMonth: contractDetails?.additionalInfo?.noticePeriodInMonth,
      firstMaintenance: contractDetails?.additionalInfo?.firstMaintenance,
      firstInvoiceDate: contractDetails?.additionalInfo?.firstInvoiceDate,
      paymentTermId: contractDetails?.paymentTerm?.id,
      description: contractDetails?.description,
      externalId: contractDetails?.externalId ?? '',
      startDate: contractDetails?.start ?? '',
      endDate: contractDetails?.end ?? '',
      autoRenewalCancelled:
        contractDetails?.additionalInfo.autoRenewalCancelled ?? false,
      numberOfUnits: contractDetails?.elevators?.length,
    },
    onSubmit: () => {},
    enableReinitialize: true,
    validationSchema,
  });

  useEffect(() => {
    setInitValue(contractDetails?.externalId);
  }, [contractDetails?.externalId, openContractDialog]);

  useEffect(() => {
    setUpdatedValue(formik.values.externalId!);
  }, [formik]);

  useEffect(() => {
    if (contractDetails?.end) {
      setCancellationDate(contractDetails?.end);
    }
  }, [contractDetails?.end]);

  const onContractSave = async () => {
    const updatedContract = {
      ...contractDetails?.additionalInfo,
      type: ContractTypes.SERVICE,
      name: formik.values?.name || '',
      renewalTerms: formik.values.renewalTerms ? formik.values.renewalTerms : 0,
      renewalDate: formik.values.autoRenewalCancelled
        ? null
        : contractDetails?.additionalInfo.renewalDate,
      price: {
        ...amountRecordForBackend({
          netAmount: +formik.values.price,
          currency,
          percentageVat:
            user?.userAccount.serviceCompany.settings.percentageVat || 0,
        }),
      },
      invoiceCycle: formik.values.invoiceCycle || '',
      visitsNumber: +formik.values.visitsNumber,
      spendingLimit: +formik.values.spendingLimit,
      startDate: formik.values.startDate,
      endDate: formik.values.endDate,
      timePreference: contractDetails?.timePreference || [],
      invoiceDueDays: formik.values.invoiceDueDays,
      annualPriceAdjustmentPercentage:
        formik.values.annualPriceAdjustmentPercentage,
      discounts: [{days: 14, discountPercentage: formik.values.discounts}],
      noticePeriodInMonth: formik.values.noticePeriodInMonth
        ? formik.values.noticePeriodInMonth
        : null,
      firstMaintenance: formik.values.firstMaintenance,
      firstInvoiceDate: formik.values.firstInvoiceDate,
      paymentTermId: formik.values.paymentTermId,
      description: formik.values.description,
      externalId: formik.values.externalId,
      autoRenewalCancelled: formik.values.autoRenewalCancelled,
    };

    await updateContract({
      body: updatedContract as any,
      contractId: contractId!,
    });
    setOpenContractDialog(false);
  };

  const onCancelContract = async () => {
    const updatedContract = {
      autoRenewalCancelled: true,
      endDate: cancellationDate,
    };

    await updateContract({
      body: updatedContract as any,
      contractId: contractId!,
    });
    setCancelContract(false);
  };

  const uploadedDocument = contractDetails?.additionalInfo?.documents;

  const onDocsPreview = async () => {
    const serviceCompanyId = user?.userAccount.serviceCompany.id;
    const uploadPath = `${serviceCompanyId}/contracts/${contractId}/documents`;
    await uploadFiles({files: documents, uploadPath});

    const updatedDocuments = uploadedDocument?.length
      ? [
          ...uploadedDocument,
          ...documents.map((item) => ({
            description: item.name.split('.')[0],
            type: item.type,
            uri: `${uploadPath}/${item.name}`,
          })),
        ]
      : [
          ...documents.map((item) => ({
            description: item.name.split('.')[0],
            type: item.type,
            uri: `${uploadPath}/${item.name}`,
          })),
        ];

    await updateContract({
      body: {
        documents: updatedDocuments,
      } as Partial<ContractRequestBody>,
      contractId: contractId!,
    });
    setOpenDocumentDialog(false);
  };

  const onRemoveDoc = async (id: string) => {
    const documentsToSave = uploadedDocument?.length
      ? uploadedDocument?.filter((d) => d.id !== id)
      : [];

    await updateContract({
      body: {
        documents: documentsToSave,
      } as Partial<ContractRequestBody>,
      contractId: contractId!,
    });
  };
  const handleCancel = () => {
    formik.resetForm();
    setOpenContractDialog(false);
  };

  const actions = useMemo(() => {
    const items = [];

    items.push({
      label: t('Edit'),
      icon: <EditIcon />,
      onClick: () => setOpenContractDialog(true),
    });

    items.push({
      label: t('Cancel contract'),
      icon: <CancelIcon />,
      onClick: () => setCancelContract(true),
    });

    return items;
  }, []);

  const unUsedContractDays =
    (!isLoading && calculateRenewDays(contractDetails)) || 0;

  if (isLoading) {
    return <Progress />;
  }

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const renderMenu = () => (
    <Menu
      id="actions-menu"
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      MenuListProps={{
        'aria-labelledby': 'actions-button',
      }}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}>
      {actions.map((item, index) => (
        <Box key={`${item.label}-${index}`}>
          <MenuItem
            onClick={() => {
              item.onClick();
              handleClose();
            }}
            sx={{py: '0.5rem'}}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText>
              <Typography variant="body2">{item.label}</Typography>
            </ListItemText>
          </MenuItem>
          {index === 0 && actions.length > 0 && (
            <Divider
              sx={{
                flexBasis: '100%',
                border: `0.5px solid ${theme.palette.action.disabledBackground}`,
                mt: '-0.5em',
                mb: '1em',
              }}
            />
          )}
        </Box>
      ))}
    </Menu>
  );

  return (
    <Box>
      <Grid
        container
        spacing={2}
        sx={{
          pb: '1em',
        }}>
        <Grid item xs={12} md={8}>
          <InfoCard
            minHeight="12rem"
            header={
              <SectionTitle
                Icon={BusinessContractApprove}
                title="Basic Information"
                containerSx={{backgroundColor: 'unset'}}
              />
            }
            headerActionIcon={
              <>
                <IconButton onClick={handleClick}>
                  <MoreIcon fontSize="small" sx={{color: 'action.active'}} />
                </IconButton>
                {renderMenu()}
              </>
            }>
            {/** TODO: Pass down the full contract instead of long props */}
            <ContractBasic
              autoRenewal={contractDetails?.additionalInfo.autoRenewalCancelled}
              costPerYear={
                formatCurrency(
                  (contractDetails?.additionalInfo?.totalYearlyPrice || 0) /
                    10 ** currentCurrency.fractionDigits,
                  {currency: contractDetails.additionalInfo.price?.currency},
                ) || '-'
              }
              renewalPeriod={contractDetails?.additionalInfo?.renewalTerms}
              numberOfUnits={contractDetails?.elevators?.length}
              name={contractDetails?.name}
              yearlyPriceAdjustment={
                contractDetails?.additionalInfo?.annualPriceAdjustmentPercentage
              }
              noticePeriod={
                contractDetails?.additionalInfo?.noticePeriodInMonth
              }
              start={contractDetails.start}
              end={contractDetails.end}
              contractNumber={contractDetails.externalId}
            />
            <Dialog
              title="Edit Contract"
              isSaving={isUpdateLoading}
              onCancel={handleCancel}
              disableSaveBtn={!!Object.keys(formik.errors).length}
              dialogProps={{
                maxWidth: 'md',
                open: openContractDialog || false,
              }}
              onSave={() => onContractSave()}>
              {!isLoading && (
                <EditContractForm
                  formik={formik}
                  currency={currency}
                  initialValues={formik.initialValues}
                />
              )}
            </Dialog>
            <CancelContract
              isLoading={isUpdateLoading}
              onCancelContract={onCancelContract}
              setCancelContract={setCancelContract}
              openCancelContract={openCancelContract}
              setCancellationDate={setCancellationDate}
              endDate={cancellationDate}
            />
          </InfoCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <ContractCard
            containerStyles={{height: '100%'}}
            header={
              <Typography
                variant="subtitle1"
                sx={{
                  paddingY: 0.5,
                  paddingX: 1,
                  borderRadius: '4px',
                  fontWeight: '600',
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'center',
                }}>
                <TimeIcon width="1.5em" height="1.5em" />
                {t('History')}
              </Typography>
            }>
            {unUsedContractDays > 0 && unUsedContractDays <= 30 ? (
              <Alert
                severity="info"
                sx={{mt: '1em', mb: '1em', py: '0.6em', alignItems: 'center'}}>
                <Typography>
                  {t('Contract renews in {{unUsedContractDays}} days!', {
                    unUsedContractDays,
                  })}
                  <br />
                </Typography>
              </Alert>
            ) : null}

            <ContractTimeline
              contractDetails={contractDetails}
              unUsedContractDays={unUsedContractDays}
            />
          </ContractCard>
        </Grid>

        <Parties contractDetails={contractDetails} user={user as UserSession} />

        <AttachDocument
          uploadedDocument={uploadedDocument}
          setOpenDocumentDialog={setOpenDocumentDialog}
          setDocuments={setDocuments}
          downloadUrls={downloadUrls}
          onRemoveDoc={onRemoveDoc}
          onDocsPreview={onDocsPreview}
          openDocumentDialog={openDocumentDialog}
          documents={documents}
          isUpdateLoading={isUpdateLoading || isUploadLoading}
          contractId={contractId}
          updateContract={updateContract as unknown as () => void}
        />

        <Services contractDetails={contractDetails} />
        <InvoiceSetup
          contractId={contractId}
          updateContract={updateContract as unknown as () => void}
          components={contractDetails.components}
        />
      </Grid>
    </Box>
  );
};
