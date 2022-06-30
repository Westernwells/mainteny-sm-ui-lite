import {FC, useMemo, useState} from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import {useUpdateContract} from 'hooks/reactQuery/useContract';
import useTheme from '@mui/material/styles/useTheme';
import EditIcon from '@mui/icons-material/Edit';
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
import {FileWithPreview, MyDropZone} from 'components/MyDropzone';
import * as Yup from 'yup';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import {formatCurrency, formatNetAmount} from 'utils/currency';
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
  const {id: contractId} = useParams();
  const theme = useTheme();
  const {mutateAsync: updateContract} = useUpdateContract('Contract updated');
  const {user} = useUserSession();

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
      price: contractDetails?.additionalInfo?.price?.netAmount || 0,
      invoiceDue: contractDetails?.additionalInfo?.invoiceDue!,
      renewalTerms: contractDetails?.additionalInfo?.renewalTerms || 0,
      visitsNumber: contractDetails?.visitsNumber || 0,
      spendingLimit: contractDetails?.spendingLimit || 0,
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
      renewalTerms: Number(formik.values.renewalTerms),
      price: {
        ...contractDetails?.additionalInfo.price,
        netAmount: Number(formik.values.price),
        currency: 'EUR',
        percentageVat: user?.userAccount.serviceCompany.settings.percentageVat,
      },
      invoiceDue: convertToMacro(formik.values.invoiceDue || ''),
      visitsNumber: formik.values.visitsNumber,
      spendingLimit: formik.values.spendingLimit,
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
        ...(contractDetails?.additionalInfo?.documents || []),
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
            <Grid item xs={8}>
              <ContractCard
                containerStyles={{
                  mt: '1em',
                  '& .MuiCardHeader-root': {
                    pb: 0,
                  },
                }}
                header={
                  <Box sx={headerStyles}>
                    <Typography variant="subtitle1" mr="0.5em">
                      Parties
                    </Typography>
                  </Box>
                }>
                <ContractParties
                  name={contractDetails?.propertyOwner.name}
                  occupation="Service Company"
                  address={
                    contractDetails?.propertyOwner.postalAddress.fullName
                  }
                  phoneNumber={contractDetails?.propertyOwner.contact.phone}
                  partyType="Contractor"
                  chipColor="warning"
                />
                <ContractParties
                  name={contractDetails?.serviceCompany.name}
                  occupation="Property manager"
                  address=""
                  phoneNumber=""
                  partyType="Customer"
                  chipColor="primary"
                />
              </ContractCard>
            </Grid>
            <Grid item xs={4}>
              <ContractCard
                containerStyles={{
                  mt: '1em',
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
                      Document
                    </Typography>
                  </Box>
                }
                headerActionIcon={
                  <Typography color="#2196F3">+ Add</Typography>
                }
                headerAction={() => setOpenDocumentDialog(true)}>
                {contractDetails?.additionalInfo?.documents?.length ? (
                  <Box sx={{height: '155px', overflowY: 'auto'}}>
                    {contractDetails?.additionalInfo?.documents.map(
                      (documnet) => (
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2,
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
                              window.open(downloadUrls[documnet.uri], '_blank')
                            }>
                            <FileCopyIcon
                              fontSize="large"
                              htmlColor="rgba(15, 76, 100, 0.5)"
                            />
                          </Box>
                          <Typography
                            align="center"
                            sx={{color: '#8F9BB3', marginTop: '10px'}}>
                            {documnet.description}
                          </Typography>
                        </Box>
                      ),
                    )}
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
                    acceptedFileTypes="application/pdf"
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
                Contract Timeline
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
                Contract expires in {unUsedContractDays} days!
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
