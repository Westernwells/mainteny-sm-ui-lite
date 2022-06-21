import {useMemo, useState} from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import {useContractDetails} from 'hooks/reactQuery/useContract';
import useTheme from '@mui/material/styles/useTheme';
import EditIcon from '@mui/icons-material/Edit';
import {useParams} from 'react-router-dom';
import {toDate} from 'utils/datetime';
import {differenceInDays, isBefore} from 'date-fns';
import {useFormik} from 'formik';
import {FormikContractView} from 'models/contract';
import {InfoCard} from 'components/InfoCard';
import {Dialog} from 'components/Dialog';

import {Progress} from 'components/Progress';
import {formatCurrency} from 'utils/currency';
import {ContractBasic} from './ContractBasic';
import {ContractTimeline} from './ContractTimeline';
import {ContractCard} from './ContractCard';
import EditContractForm from './EditContractForm';
import {ContractParties} from './ContractParties';
import ContractDocument from './ContractDocument';

export const ContractOverview = () => {
  const {id: contractId} = useParams();
  const theme = useTheme();
  const {data: contractDetails, isLoading} = useContractDetails(contractId!);

  const [openContractDialog, setOpenContractDialog] = useState(false);

  const formik = useFormik<FormikContractView>({
    initialValues: {
      type: contractDetails?.type!,
      price: contractDetails?.additionalInfo?.price.netAmount || 0,
      invoiceDue: contractDetails?.additionalInfo?.invoiceDue!,
      renewalTerms: contractDetails?.additionalInfo?.renewalTerms || 0,
      visitsNumber: contractDetails?.visitsNumber || 0,
      spendingLimit: contractDetails?.spendingLimit || 0,
    },
    onSubmit: () => {},
    enableReinitialize: true,
    // validationSchema,
  });

  const onContractSave = () => {};

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

  const totalContractDays =
    !isLoading &&
    differenceInDays(
      toDate(contractDetails?.endTime),
      toDate(contractDetails?.startTime),
    );

  const usedContractDays =
    !isLoading && isBefore(new Date(), toDate(contractDetails?.endTime))
      ? differenceInDays(new Date(), toDate(contractDetails?.startTime))
      : differenceInDays(
          toDate(contractDetails?.endTime),
          toDate(contractDetails?.startTime),
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
              type={contractDetails?.type}
              numberOfVisits={0}
              costPerYear={formatCurrency(
                contractDetails && contractDetails.additionalInfo?.price
                  ? contractDetails.additionalInfo.price.netAmount
                  : 0,
                {
                  currency: contractDetails?.currency || 'EUR',
                },
              )}
              spendingLimit={formatCurrency(
                contractDetails ? contractDetails.spendingLimit : 0,
                {
                  currency: contractDetails?.currency || 'EUR',
                },
              )}
              renewalPeriod={contractDetails?.additionalInfo?.renewalTerms}
              invoiceDue={contractDetails?.additionalInfo?.invoiceDue}
              numberOfUnits={0}
            />
            <Dialog
              title="Edit Contract"
              onCancel={() => setOpenContractDialog(false)}
              // disableSaveBtn={!!Object.keys(formik.errors).length}
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
                }>
                <ContractDocument />
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
              usedContractDays={usedContractDays}
              totalContractDays={totalContractDays}
            />
          </ContractCard>
        </Grid>
      </Grid>
    </Box>
  );
};
