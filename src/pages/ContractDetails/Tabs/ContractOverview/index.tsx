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
import {useMediaQuery} from '@mui/material';
import {useParams} from 'react-router-dom';
import {useFormik} from 'formik';
import {
  ContractOrderField,
  ContractRequestBody,
  ContractUpdateRequest,
  ContractView,
} from 'models/contract';
import {InfoCard} from 'components/InfoCard';
import {Dialog} from 'components/Dialog';
import {Progress} from 'components/Progress';
import {EmptySection} from 'components/EmptySection';
import {FileWithPreview, MyDropZone} from 'components/MyDropZone/MyDropzone';
import {Button} from 'components/Button';
import * as Yup from 'yup';
import FileCopyIcon from '@mui/icons-material/FileCopy';
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
import {DescriptionForm} from './DescriptionForm';
import {SectionTitle} from '../../../InvoiceDetails/SectionTitle';
import {CancelContract} from './CancelContract';
import {Parties} from './Parties';

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
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [openContractDialog, setOpenContractDialog] = useState(false);
  const [openDocumentDialog, setOpenDocumentDialog] = useState(false);

  const [openCancelContract, setCancelContract] = useState(false);
  const [cancellationDate, setCancellationDate] = useState(
    contractDetails?.end || '',
  );

  const [documents, setDocuments] = useState<FileWithPreview[]>([]);
  const [openDescriptionDialog, setOpenDescriptionDialog] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const {mutateAsync: uploadFiles} = useUploadFiles(
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
    const contractNameType =
      user?.userAccount?.serviceCompany?.settings?.contractNameTypes.find(
        (item) => item.name === formik.values.name,
      );

    const updatedContract = {
      ...contractDetails?.additionalInfo,
      type: contractNameType?.type || '',
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

  const onDocsPreview = async () => {
    const serviceCompanyId = user?.userAccount.serviceCompany.id;
    const uploadPath = `${serviceCompanyId}/contracts/${contractId}/documents`;
    await uploadFiles({files: documents, uploadPath});
    const updatedContract = {
      ...contractDetails,
      ...contractDetails?.additionalInfo,
      documents: [
        ...documents.map((item) => ({
          description: item.name.split('.')[0],
          type: item.type,
          uri: `${uploadPath}/${item.name}`,
        })),
      ],
      startDate: contractDetails?.start,
      endDate: contractDetails?.end,
    };
    await updateContract({
      body: updatedContract as Partial<ContractRequestBody>,
      contractId: contractId!,
    });
    setOpenDocumentDialog(false);
  };

  const onRemoveDoc = async () => {
    await updateContract({
      body: {
        documents: [],
      } as Partial<ContractRequestBody>,
      contractId: contractId!,
    });
  };

  const handleSaveDescription = () => {
    updateContract(
      {
        body: {
          description: formik.values.description,
        } as Partial<ContractRequestBody>,
        contractId: contractId!,
      },
      {onSuccess: () => setOpenDescriptionDialog(false)},
    );
  };

  const handleCancel = () => {
    formik.resetForm();
    setOpenContractDialog(false);
  };

  const headerStyles = useMemo(
    () => ({
      display: 'flex',
      justifyContent: 'space-between',
      width: '100%',
      paddingX: 1,
      paddingY: 0.5,
      backgroundColor: theme.palette.inputBackground.main,
      borderRadius: '4px',
    }),
    [],
  );

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

  const uploadedDocument = contractDetails?.additionalInfo?.documents;
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
                  (contractDetails?.additionalInfo?.price?.netAmount || 0) /
                    10 **
                      (contractDetails?.additionalInfo?.price
                        ?.fractionDigits! || 0),
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
              discount={contractDetails?.additionalInfo?.discounts?.map(
                (item) =>
                  `${t('{{discountPercentage}}% when paid in {{days}} days', {
                    discountPercentage: item.discountPercentage,
                    days: item.days,
                  })}`,
              )}
              start={contractDetails.start}
              end={contractDetails.end}
              contractNumber={contractDetails.externalId}
            />
            <Dialog
              title="Edit Contract"
              isSaving={isUpdateLoading}
              onCancel={handleCancel}
              disableSaveBtn={
                !!Object.keys(formik.errors).length || !formik.dirty
              }
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
                  backgroundColor: theme.palette.inputBackground.main,
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

        <Grid item xs={12} md={4}>
          <ContractCard
            containerStyles={{
              mt: !isMobile ? '1em' : 0,
              pt: 2,
              px: 2,
              height: 'calc(100% - 1em)',
              '& .MuiCardHeader-root': {
                ...headerStyles,
                py: 0,
              },
            }}
            header={
              <Box sx={headerStyles}>
                <Typography variant="subtitle1" mr="0.5em">
                  {t('Document')}
                </Typography>
              </Box>
            }
            headerActionIcon={
              <Typography color="#2196F3">{`+ ${t('Add')}`}</Typography>
            }
            headerAction={() => setOpenDocumentDialog(true)}>
            {uploadedDocument && uploadedDocument[0] ? (
              <Box
                sx={{
                  height: '9.688em',
                  overflowY: 'auto',
                  display: 'flex',
                  justifyContent: 'center',
                  flexDirection: 'column',
                }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mt: 2,
                    cursor: 'pointer',
                  }}>
                  <Box
                    sx={{
                      border: '1px solid #8F9BB380',
                      padding: '1em',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      borderRadius: '4px',
                    }}
                    onClick={() =>
                      window.open(
                        downloadUrls[
                          contractDetails?.additionalInfo?.documents![0]?.uri
                        ],
                        '_blank',
                      )
                    }>
                    <FileCopyIcon
                      fontSize="large"
                      htmlColor="rgba(15, 76, 100, 0.5)"
                    />
                  </Box>
                  <Typography
                    align="center"
                    sx={{color: 'text.secondary', marginTop: '0.625em'}}>
                    {uploadedDocument && uploadedDocument[0].description}
                  </Typography>
                  <Button
                    buttonProps={{
                      color: 'error',
                      onClick: onRemoveDoc,
                    }}>
                    Remove
                  </Button>
                </Box>
              </Box>
            ) : (
              <EmptySection
                label="No documents attached. They will appear here once added!"
                illustration="clipboard"
                size="tiny"
                containerStyle={{
                  height: '100%',
                }}
              />
            )}
            <Dialog
              title="Add Documents"
              isSaving={false}
              onCancel={() => setOpenDocumentDialog(false)}
              onSave={() => onDocsPreview()}
              disableSaveBtn={!documents.length}
              dialogProps={{
                maxWidth: 'md',
                open: openDocumentDialog || false,
              }}>
              <MyDropZone
                getAcceptedFiles={(dropedFiles) => {
                  setDocuments(dropedFiles);
                }}
                acceptedFileTypes={[
                  'application/pdf',
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                  'application/vnd.ms-excel',
                  'text/tab-separated-values',
                  'text/csv',
                ]}
                maxFiles={1}
              />
            </Dialog>
          </ContractCard>
        </Grid>

        <Grid item xs={12} md={8}>
          <ContractCard
            containerStyles={{
              mt: !isMobile ? '1em' : 0,
              pt: 2,
              px: 2,
              height: '100%',
              '& .MuiCardHeader-root': {
                ...headerStyles,
                py: 0,
              },
            }}
            header={
              <Box sx={headerStyles}>
                <Typography variant="subtitle1" mr="0.5em">
                  {t('Description')}
                </Typography>
              </Box>
            }
            headerActionIcon={<EditIcon />}
            headerAction={() => setOpenDescriptionDialog(true)}>
            {contractDetails.description ? (
              <Typography variant="body2">
                {contractDetails.description}
              </Typography>
            ) : (
              <EmptySection
                label="No description added."
                illustration="clipboard"
                size="tiny"
                containerStyle={{
                  height: '100%',
                }}
              />
            )}
            <Dialog
              title="Edit Description"
              onCancel={() => setOpenDescriptionDialog(false)}
              disableSaveBtn={!!Object.keys(formik.errors).length}
              onSave={handleSaveDescription}
              dialogProps={{
                maxWidth: 'sm',
                open: openDescriptionDialog,
              }}>
              <DescriptionForm formik={formik} />
            </Dialog>
          </ContractCard>
        </Grid>
      </Grid>
    </Box>
  );
};
