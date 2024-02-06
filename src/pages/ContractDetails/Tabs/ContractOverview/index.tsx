import {FC, useEffect, useMemo, useState} from 'react';
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
import {PopperProps, useMediaQuery} from '@mui/material';
import {useParams} from 'react-router-dom';
import {useFormik} from 'formik';
import {
  ContractOrderField,
  ContractPaymentTermView,
  ContractRequestBody,
  ContractStatus,
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
import {
  calculateRenewDays,
  contractTypeMap,
  invoiceCycle,
} from 'utils/contract-utils';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import Tooltip from '@mui/material/Tooltip';
import {formatDate, isDateInPast} from 'utils/datetime';
import {StatusChip} from 'components/StatusChip';
import {capitalize} from 'lodash';
import {Order} from 'models/misc';
import {createEmptyResource} from 'utils/paging-utils';
import {ContractPaymentTermInput} from 'components/ContractPaymentTermInput';
import {ContractPaymentTerm} from 'components/ContractPaymentTerm';
import {ContractBasic} from './ContractBasic';
import {ContractTimeline} from './ContractTimeline';
import {ContractCard} from './ContractCard';
import EditContractForm from './EditContractForm';
import {ContractParties} from './ContractParties';
import {DescriptionForm} from './DescriptionForm';

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
  const {mutateAsync: updateContract} = useUpdateContract('Contract updated');
  const {user} = useUserSession();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [openContractDialog, setOpenContractDialog] = useState(false);
  const [openDocumentDialog, setOpenDocumentDialog] = useState(false);

  const [documents, setDocuments] = useState<FileWithPreview[]>([]);
  const [openDescriptionDialog, setOpenDescriptionDialog] = useState(false);
  const [openContractPaymentTermsDialog, setOpenContractPaymentTermsDialog] =
    useState(false);
  const [
    openContractPaymentTermSelectDialog,
    setOpenContractPaymentTermSelectDialog,
  ] = useState(false);

  const [paymentTermToEdit, setPaymentTermToEdit] = useState<
    ContractPaymentTermView | undefined
  >(undefined);

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

  const onContractSave = async () => {
    const contractNameType =
      user?.userAccount?.serviceCompany?.settings?.contractNameTypes.find(
        (item) => item.name === formik.values.name,
      );
    const isContractRenewable =
      !formik.values.renewalTerms && isDateInPast(formik.values.endDate);

    const updatedContract = {
      ...contractDetails?.additionalInfo,
      type: contractNameType?.type || '',
      name: formik.values?.name || '',
      renewalTerms: formik.values.renewalTerms ? formik.values.renewalTerms : 0,
      renewalDate: isContractRenewable
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
      autoRenewalCancelled: isContractRenewable,
    };

    await updateContract({
      body: updatedContract as any,
      contractId: contractId!,
    });
    setOpenContractDialog(false);
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

  const handleContractPaymentTermsModal = (paymentTermId: string) => {
    updateContract(
      {
        body: {
          paymentTermId,
        } as Partial<ContractRequestBody>,
        contractId: contractId!,
      },
      {onSuccess: () => setOpenContractPaymentTermsDialog(false)},
    );
  };

  const handleAutoRenewal = () => {
    formik.setFieldValue(
      'autoRenewalCancelled',
      !formik.values.autoRenewalCancelled,
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

  const unUsedContractDays =
    (!isLoading && calculateRenewDays(contractDetails)) || 0;

  if (isLoading) {
    return <Progress />;
  }

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
            headerStyles={headerStyles}
            bodyContainerStyle={{}}
            handleAction={() => setOpenContractDialog(true)}
            header={
              <Box sx={{display: 'flex', alignItems: 'center'}}>
                <Typography variant="subtitle1">
                  {contractDetails?.externalId}
                </Typography>

                <StatusChip
                  color={
                    contractDetails?.status === ContractStatus.VALID
                      ? 'success'
                      : contractDetails?.status === ContractStatus.EXPIRING
                      ? 'warning'
                      : 'error'
                  }
                  label={
                    contractDetails?.status === ContractStatus.PENDING ||
                    contractDetails?.status === ContractStatus.EXPIRED
                      ? 'Inactive'
                      : contractDetails?.status === ContractStatus.VALID
                      ? 'Active'
                      : capitalize(contractDetails?.status!)
                  }
                  style={{ml: '2em'}}
                />
              </Box>
            }
            headerActionIcon={<EditIcon />}>
            {/** TODO: Pass down the full contract instead of long props */}
            <ContractBasic
              numberOfVisits={contractDetails?.visitsNumber}
              costPerYear={
                formatCurrency(
                  (contractDetails?.additionalInfo?.price?.netAmount || 0) /
                    10 **
                      (contractDetails?.additionalInfo?.price
                        ?.fractionDigits! || 0),
                  {currency: contractDetails.additionalInfo.price?.currency},
                ) || '-'
              }
              spendingLimit={formatCurrency(
                contractDetails ? contractDetails?.spendingLimit : 0,
                {currency: contractDetails.additionalInfo.price?.currency},
              )}
              renewalPeriod={contractDetails?.additionalInfo?.renewalTerms}
              invoiceCycle={
                contractDetails?.additionalInfo?.invoiceCycle !== undefined &&
                contractDetails?.additionalInfo?.invoiceCycle >= 0
                  ? invoiceCycle[contractDetails?.additionalInfo?.invoiceCycle]
                  : ''
              }
              numberOfUnits={contractDetails?.elevators?.length}
              type={contractTypeMap[contractDetails?.type]}
              name={contractDetails?.name}
              paymentDue={contractDetails?.additionalInfo?.invoiceDueDays}
              yearlyPriceAdjustment={
                contractDetails?.additionalInfo?.annualPriceAdjustmentPercentage
              }
              noticePreiod={
                contractDetails?.additionalInfo?.noticePeriodInMonth
              }
              discount={contractDetails?.additionalInfo?.discounts?.map(
                (item) =>
                  `${t('{{discountPercentage}}% when paid in {{days}} days', {
                    discountPercentage: item.discountPercentage,
                    days: item.days,
                  })}`,
              )}
              firstMaintenance={contractDetails.additionalInfo.firstMaintenance}
              firstInvoiceDate={contractDetails.additionalInfo.firstInvoiceDate}
            />
            <Dialog
              title="Edit Contract"
              onCancel={handleCancel}
              disableSaveBtn={
                !!Object.keys(formik.errors).length || !formik.dirty
              }
              onSave={() => onContractSave()}
              dialogProps={{open: openContractDialog || false}}
              leftButton={
                <Tooltip
                  title={
                    !formik.values.autoRenewalCancelled
                      ? t('This contract is ending on {{endDate}}', {
                          endDate: formatDate(formik.values.endDate),
                        })
                      : ''
                  }
                  placement="top-end"
                  arrow
                  PopperProps={
                    {
                      sx: {
                        marginRight: '-4.6em !important',
                      },
                    } as Partial<PopperProps> | undefined
                  }>
                  <span>
                    <Button
                      buttonProps={{
                        onClick: handleAutoRenewal,
                        size: 'large',
                        sx: {marginLeft: '1em'},
                        color: !formik.values.autoRenewalCancelled
                          ? 'error'
                          : 'primary',
                        endIcon: !formik.values.autoRenewalCancelled && (
                          <ReportProblemOutlinedIcon />
                        ),
                      }}>
                      <Typography variant="subtitle2">
                        {!formik.values.autoRenewalCancelled
                          ? t('End Contract')
                          : t('Resume Contract')}
                      </Typography>
                    </Button>
                  </span>
                </Tooltip>
              }>
              {!isLoading && (
                <EditContractForm
                  formik={formik}
                  currency={currency}
                  initialValues={formik.initialValues}
                />
              )}
            </Dialog>
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
                }}>
                {t('Contract Timeline')}
              </Typography>
            }>
            {unUsedContractDays > 0 && unUsedContractDays <= 30 ? (
              <Alert
                variant="filled"
                severity="warning"
                sx={{
                  mb: '1em',
                  background: theme.palette.warning.outlinedHoverBg,
                  color: theme.palette.warning.main,
                }}>
                {t('Contract renews in {{unUsedContractDays}} days!', {
                  unUsedContractDays,
                })}
              </Alert>
            ) : null}

            <ContractTimeline
              contractDetails={contractDetails}
              unUsedContractDays={unUsedContractDays}
            />
          </ContractCard>
        </Grid>

        <Grid item xs={12} md={8}>
          <ContractCard
            containerStyles={{
              mt: '1em',
              '& .MuiCardHeader-root': {
                pb: 0,
              },
              height: 'calc(100% - 1em)',
            }}
            header={
              <Box sx={headerStyles}>
                <Typography variant="subtitle1" mr="0.5em">
                  {t('Parties')}
                </Typography>
              </Box>
            }>
            <ContractParties
              name={user?.userAccount.serviceCompany.name}
              occupation="Service Company"
              address={
                user?.userAccount.serviceCompany.postalAddress?.fullName ?? ''
              }
              phoneNumber={user?.userAccount.serviceCompany.contact.phone}
              partyType="CONTRACTOR"
              chipStyles={{
                chipMaxChars: 15,
                chipColor: 'warning',
              }}
            />
            <ContractParties
              name={contractDetails?.propertyOwner.name}
              occupation="Property Owner"
              address={
                contractDetails?.propertyOwner.billingAddress?.fullName ?? ''
              }
              phoneNumber={contractDetails?.propertyOwner.contact.phone}
              partyType="CUSTOMER"
              chipStyles={{
                chipColor: 'primary',
              }}
            />
          </ContractCard>
        </Grid>

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

        <Grid item xs={12} md={4}>
          <ContractCard
            containerStyles={{
              mt: !isMobile ? '1em' : 0,
              pt: 2,
              px: 2,
              height: '100%',
              [theme.breakpoints.up('md')]: {
                minHeight: '13rem',
              },
              '& .MuiCardHeader-root': {
                ...headerStyles,
                py: 0,
              },
            }}
            header={
              <Box sx={headerStyles}>
                <Typography variant="subtitle1" mr="0.5em">
                  {t('Payment Terms')}
                </Typography>
              </Box>
            }
            headerActionIcon={<EditIcon />}
            headerAction={() => setOpenContractPaymentTermsDialog(true)}>
            {contractDetails?.paymentTerm?.term ? (
              <Typography variant="body2">
                {contractDetails.paymentTerm.term}
              </Typography>
            ) : (
              <EmptySection
                label="No payment terms applied"
                illustration="clipboard"
                size="tiny"
                containerStyle={{
                  height: '100%',
                }}
              />
            )}

            <ContractPaymentTermInput
              title={t('New payment term')}
              open={openContractPaymentTermSelectDialog}
              onCancel={() => setOpenContractPaymentTermSelectDialog(false)}
              defaultPaymentTerm={paymentTermToEdit}
              setPaymentToEdit={setPaymentTermToEdit}
            />

            <ContractPaymentTerm
              title={t('Payment Terms')}
              open={openContractPaymentTermsDialog}
              onCancel={() => setOpenContractPaymentTermsDialog(false)}
              onSave={handleContractPaymentTermsModal}
              defaultPayment={contractDetails?.paymentTerm?.term}
              onClickNewPaymentTerm={() =>
                setOpenContractPaymentTermSelectDialog(true)
              }
              setPaymentToEdit={setPaymentTermToEdit}
            />
          </ContractCard>
        </Grid>
      </Grid>
    </Box>
  );
};
