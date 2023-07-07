import {FC, useContext, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import {useUpdateContract} from 'hooks/reactQuery/useContract';
import useTheme from '@mui/material/styles/useTheme';
import EditIcon from '@mui/icons-material/Edit';
import {useMediaQuery} from '@mui/material';
import {useParams} from 'react-router-dom';
import {toDate} from 'utils/datetime';
import {differenceInDays, isBefore} from 'date-fns';
import {useFormik} from 'formik';
import {
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
import {ContractPaymentTermSelectDialog} from 'components/ContractPaymentTermSelectModal';
import {ContractPaymentTermsDialog} from 'components/ContractPaymentTermsDialog';
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
import {LanguageContext} from 'context/LanguageProvider';
import {contractTypeMap, invoiceCycle} from 'utils/contract-utils';
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

const validationSchema = Yup.object().shape({
  renewalTerms: Yup.number()
    .min(0, 'Renewal period must be between 0-12 months')
    .max(12, 'Renewal period must be between 0-12 months'),
});

export const ContractOverview: FC<Props> = ({contractDetails, isLoading}) => {
  const {t} = useTranslation();
  const currentCurrency = useCurrentCurrency();
  const currency = contractDetails?.currency ?? currentCurrency.code;
  const {language: selectedLng} = useContext(LanguageContext);
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

  const {mutateAsync: uploadFiles} = useUploadFiles(
    'Documents uploaded successfully',
  );

  const {data: downloadUrls = {}} = useDownloadUrl(
    contractDetails?.additionalInfo?.documents
      ? contractDetails.additionalInfo.documents.map((item) => item.uri)
      : [],
  );

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
      hourlyRate: contractDetails?.hourlyRate,
      invoiceDueDays: contractDetails?.additionalInfo?.invoiceDueDays,
      annualPriceAdjustmentPercentage:
        contractDetails?.additionalInfo?.annualPriceAdjustmentPercentage,
      discounts:
        contractDetails?.additionalInfo &&
        contractDetails?.additionalInfo?.discounts &&
        contractDetails?.additionalInfo?.discounts[0].days,
      noticePeriodInMonth: contractDetails?.additionalInfo?.noticePeriodInMonth,
      firstMaintenance: contractDetails?.additionalInfo?.firstMaintenance,
      firstInvoiceDate: contractDetails?.additionalInfo?.firstInvoiceDate,
      paymentTerms: contractDetails?.additionalInfo.paymentTerms,
      description: contractDetails?.description,
    },
    onSubmit: () => {},
    enableReinitialize: true,
    validationSchema,
  });

  const onContractSave = async () => {
    const contractNameType =
      user?.userAccount?.serviceCompany?.settings?.contractNameTypes.find(
        (item) => item.name === formik.values.name,
      );
    const updatedContract = {
      ...contractDetails,
      type: contractNameType?.type || '',
      name: formik.values?.name || '',
      ...contractDetails?.additionalInfo,
      renewalTerms: formik.values.renewalTerms,
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
      hourlyRate: formik.values.hourlyRate || '',
      startDate: contractDetails?.startTime,
      endDate: contractDetails?.endTime,
      timePreference: contractDetails?.timePreference || [],
      invoiceDueDays: formik.values.invoiceDueDays,
      annualPriceAdjustmentPercentage:
        formik.values.annualPriceAdjustmentPercentage,
      discounts: formik.values.discounts && [
        {days: 14, discountPercentage: formik.values.discounts},
      ],
      noticePeriodInMonth: formik.values.noticePeriodInMonth,
      firstMaintenance: formik.values.firstMaintenance,
      firstInvoiceDate: formik.values.firstInvoiceDate,
      paymentTerms: formik.values.paymentTerms,
      description: formik.values.description,
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
      startDate: contractDetails?.startTime,
      endDate: contractDetails?.endTime,
      timePreference: contractDetails?.timePreference || [],
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

  const handleContractPaymentTermsModal = (paymentTerms: string) => {
    updateContract(
      {
        body: {
          paymentTerms,
        } as Partial<ContractRequestBody>,
        contractId: contractId!,
      },
      {onSuccess: () => setOpenContractPaymentTermsDialog(false)},
    );
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
    !isLoading && isBefore(new Date(), toDate(contractDetails?.endTime))
      ? differenceInDays(toDate(contractDetails?.endTime), new Date())
      : 0;

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
              <Box>
                <Typography variant="subtitle1">
                  {contractDetails?.number}
                </Typography>
              </Box>
            }
            headerActionIcon={<EditIcon />}>
            {/** TODO: Pass down the full contract instead of long props */}
            <ContractBasic
              status={contractDetails?.status}
              numberOfVisits={contractDetails?.visitsNumber}
              costPerYear={
                formatCurrency(
                  (contractDetails?.additionalInfo?.price?.netAmount || 0) /
                    10 **
                      (contractDetails?.additionalInfo?.price
                        ?.fractionDigits! || 0),
                  {currency},
                  selectedLng,
                ) || '-'
              }
              spendingLimit={formatCurrency(
                contractDetails ? contractDetails?.spendingLimit : 0,
                {currency},
                selectedLng,
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
                  `${item.discountPercentage}% when paid in ${item.days} days`,
              )}
              hourlyRate={formatCurrency(
                contractDetails ? contractDetails.hourlyRate : 0,
                {currency},
                selectedLng,
              )}
              firstMaintenance={contractDetails.additionalInfo.firstMaintenance}
              firstInvoiceDate={contractDetails.additionalInfo.firstInvoiceDate}
            />
            <Dialog
              title="Edit Contract"
              onCancel={() => setOpenContractDialog(false)}
              disableSaveBtn={!!Object.keys(formik.errors).length}
              onSave={() => onContractSave()}
              dialogProps={{open: openContractDialog || false}}>
              {!isLoading && (
                <EditContractForm formik={formik} currency={currency} />
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
              address={user?.userAccount.serviceCompany.postalAddress?.fullName}
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
              address={contractDetails?.propertyOwner.postalAddress?.fullName}
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
              <Typography color="#2196F3">{t('+ Add')}</Typography>
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
                  {t('Payment terms')}
                </Typography>
              </Box>
            }
            headerActionIcon={<EditIcon />}
            headerAction={() => setOpenContractPaymentTermSelectDialog(true)}>
            {contractDetails.additionalInfo.paymentTerms ? (
              <Typography variant="body2">
                {contractDetails.additionalInfo.paymentTerms}
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

            <ContractPaymentTermSelectDialog
              title={t('Payment Terms')}
              alertText={t('Choose a payment term to be used on your invoice')}
              open={openContractPaymentTermSelectDialog}
              onSave={handleContractPaymentTermsModal}
              onCancel={() => setOpenContractPaymentTermSelectDialog(false)}
              onClickPaymentTerms={() =>
                setOpenContractPaymentTermsDialog(true)
              }
            />

            <ContractPaymentTermsDialog
              title={t('Manage Payment Terms')}
              alertText={t(
                'Add your payment terms that would be used later in invoicing',
              )}
              open={openContractPaymentTermsDialog}
              onCancel={() => setOpenContractPaymentTermsDialog(false)}
            />
          </ContractCard>
        </Grid>
      </Grid>
    </Box>
  );
};
