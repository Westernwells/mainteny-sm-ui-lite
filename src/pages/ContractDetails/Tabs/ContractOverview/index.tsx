import {FC, useMemo, useState} from 'react';
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
import * as Yup from 'yup';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import {
  amountForView,
  amountRecordForBackend,
  formatCurrency,
  formatNetAmount,
} from 'utils/currency';
import {convertToMacro, convertToText} from 'utils/utils';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {useUploadFiles} from 'hooks/reactQuery/useUploadSignedUrl';
import {ContractBasic} from './ContractBasic';
import {ContractTimeline} from './ContractTimeline';
import {ContractCard} from './ContractCard';
import EditContractForm from './EditContractForm';
import {ContractParties} from './ContractParties';

interface Props {
  contractDetails: ContractView;
  isLoading: boolean;
}

const validationSchema = Yup.object().shape({
  renewalTerms: Yup.number()
    .min(0, '0 is minimal value')
    .max(12, '12 is maximum value'),
});

export const ContractOverview: FC<Props> = ({contractDetails, isLoading}) => {
  const {t} = useTranslation();
  const {id: contractId} = useParams();
  const theme = useTheme();
  const {mutateAsync: updateContract} = useUpdateContract('Contract updated');
  const {user} = useUserSession();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [openContractDialog, setOpenContractDialog] = useState(false);
  const [openDocumentDialog, setOpenDocumentDialog] = useState(false);

  const [documents, setDocuments] = useState<FileWithPreview[]>([]);

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
      price: contractDetails?.additionalInfo?.price
        ? amountForView(contractDetails?.additionalInfo?.price).netAmount
        : '',
      invoiceDue: contractDetails?.additionalInfo?.invoiceDue!,
      renewalTerms: contractDetails?.additionalInfo?.renewalTerms || '',
      visitsNumber: contractDetails?.visitsNumber || '',
      spendingLimit: contractDetails?.spendingLimit || '',
    },
    onSubmit: () => {},
    enableReinitialize: true,
    validationSchema,
  });

  const onContractSave = async () => {
    const updatedContract = {
      ...contractDetails,
      type: convertToMacro(formik.values.type || ''),
      ...contractDetails?.additionalInfo,
      renewalTerms: +formik.values.renewalTerms,
      price: {
        ...amountRecordForBackend({
          netAmount: +formik.values.price,
          currency: 'EUR',
          percentageVat:
            user?.userAccount.serviceCompany.settings.percentageVat || 0,
        }),
      },
      invoiceDue: convertToMacro(formik.values.invoiceDue || ''),
      visitsNumber: +formik.values.visitsNumber,
      spendingLimit: +formik.values.spendingLimit,
      startDate: contractDetails?.startTime,
      endDate: contractDetails?.endTime,
      timePreference: contractDetails?.timePreference || [],
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
        <Grid xs={8} item>
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
            <ContractBasic
              numberOfVisits={contractDetails?.visitsNumber}
              costPerYear={
                formatNetAmount(contractDetails.additionalInfo?.price) || '-'
              }
              spendingLimit={formatCurrency(
                contractDetails ? contractDetails.spendingLimit : 0,
                {
                  currency: contractDetails?.currency || 'EUR',
                },
              )}
              renewalPeriod={contractDetails?.additionalInfo?.renewalTerms}
              invoiceDue={convertToText(
                contractDetails?.additionalInfo?.invoiceDue || '',
              )}
              numberOfUnits={contractDetails?.elevators?.length}
              type={contractDetails?.type.toLowerCase()}
            />
            <Dialog
              title="Edit Contract"
              onCancel={() => setOpenContractDialog(false)}
              disableSaveBtn={!!Object.keys(formik.errors).length}
              onSave={() => onContractSave()}
              dialogProps={{open: openContractDialog || false}}>
              {!isLoading && <EditContractForm formik={formik} />}
            </Dialog>
          </InfoCard>

          <Grid container spacing={2}>
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
                    user?.userAccount.serviceCompany.postalAddress?.fullName
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
                    contractDetails?.propertyOwner.postalAddress.fullName
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
                              contractDetails?.additionalInfo?.documents![0]
                                ?.uri
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
                    </Box>
                  </Box>
                ) : (
                  <EmptySection
                    label="No document yet. It will be appear here once added."
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
                    acceptedFileTypes="application/pdf"
                    maxFiles={1}
                  />
                </Dialog>
              </ContractCard>
            </Grid>
          </Grid>
        </Grid>
        <Grid xs={4} item>
          <ContractCard
            containerStyles={{
              height: '100%',
              py: '1em',
              '& .MuiCardHeader-root': {
                py: 0,
              },
            }}
            bodyContainerStyle={{height: '100%'}}
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
                {t('Contract expires in {{unUsedContractDays}} days!', {
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
      </Grid>
    </Box>
  );
};
