import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import {useContractDetails} from 'hooks/reactQuery/useContract';
import Tooltip from '@mui/material/Tooltip';
import useTheme from '@mui/material/styles/useTheme';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import {useLocation} from 'react-router-dom';
import {StatusChip} from 'components/StatusChip';
import {toDate} from 'utils/datetime';
import {differenceInDays, isBefore} from 'date-fns';
import {InfoCard} from 'components/InfoCard';

import {Progress} from 'components/Progress';
import {formatCurrency} from 'utils/currency';
import {ContractBasic} from './ContractBasic';
import {ContractParties} from './ContractParties';
import {ContractScope} from './ContractScope';
import {ContractTimeline} from './ContractTimeline';
import {ContractCard} from './ContractCard';

export const ContractOverview = () => {
  const contractId = (useLocation().state as any).id;
  const theme = useTheme();
  const {data: contractDetails, isLoading} = useContractDetails(contractId!);

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
            containerStyles={{pt: '1em'}}
            bodyContainerStyle={{}}
            header={
              <Box display="flex" justifyContent="space-between">
                <Typography variant="subtitle1">
                  {contractDetails?.number}
                </Typography>
                <StatusChip color="success" label="In Effect" />
              </Box>
            }>
            <ContractBasic
              startTime={contractDetails?.startTime}
              endTime={contractDetails?.endTime}
              costPerYear={formatCurrency(
                contractDetails ? contractDetails.price! : 0,
                {
                  currency: contractDetails?.currency || 'EUR',
                },
              )}
              type={contractDetails?.type.toLowerCase()}
            />
          </InfoCard>

          <ContractCard
            containerStyles={{mt: '1em', pt: '1em'}}
            minHeight="13rem"
            header={
              <Box display="flex">
                <Typography variant="subtitle1" mr="0.5em">
                  Scope of Work
                </Typography>
                <Tooltip
                  title="All the work and materials that are included in the contract"
                  placement="bottom-start"
                  componentsProps={{
                    tooltip: {
                      sx: {
                        bgcolor: 'common.black',
                        '& .MuiTooltip-arrow': {
                          color: 'common.black',
                        },
                      },
                    },
                  }}
                  arrow>
                  <ErrorOutlineIcon
                    sx={{
                      mt: '0.25em',
                      width: '1.04rem',
                      height: '1.04rem',
                      color: theme.palette.action.active,
                    }}
                  />
                </Tooltip>
              </Box>
            }>
            <ContractScope />
          </ContractCard>

          <ContractCard
            containerStyles={{mt: '1em', py: '1em'}}
            header={
              <Box display="flex">
                <Typography variant="subtitle1" mr="0.5em">
                  Parties
                </Typography>
                <Tooltip
                  title="Entities signing the contract"
                  placement="bottom-start"
                  componentsProps={{
                    tooltip: {
                      sx: {
                        bgcolor: 'common.black',
                        '& .MuiTooltip-arrow': {
                          color: 'common.black',
                        },
                      },
                    },
                  }}
                  arrow>
                  <ErrorOutlineIcon
                    sx={{
                      mt: '0.25em',
                      width: '1.04rem',
                      height: '1.04rem',
                      color: theme.palette.action.active,
                    }}
                  />
                </Tooltip>
              </Box>
            }>
            <ContractParties
              companyName={contractDetails?.serviceCompany.name}
              personName={contractDetails?.serviceCompany.name}
              email={contractDetails?.serviceCompany.contact.email}
              partyType="Contractor"
              chipColor="info"
            />
            <ContractParties
              companyName={contractDetails?.propertyOwner.name}
              personName={contractDetails?.propertyOwner.name}
              email={contractDetails?.propertyOwner.contact.email}
              partyType="Customer"
              chipColor="info"
            />
          </ContractCard>
        </Grid>
        <Grid xs={4} item>
          <ContractCard
            containerStyles={{height: '100%', py: '1em'}}
            bodyContainerStyle={{height: '100%'}}
            header={
              <Typography variant="subtitle1">Contract Timeline</Typography>
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
