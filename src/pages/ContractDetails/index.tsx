import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import {useContractDetails} from 'hooks/reactQuery/useContract';
import Tooltip from '@mui/material/Tooltip';
import {CustomButtonUnstyled} from 'components/CustomButtonUnstyled';
import useTheme from '@mui/material/styles/useTheme';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import {useNavigate, useParams} from 'react-router-dom';
import {StatusChip} from 'components/StatusChip';
import {BackAction} from 'components/BackAction';
import {toDate} from 'utils/datetime';
import {differenceInDays, intervalToDuration, isBefore} from 'date-fns';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import {BasicDetailsCard} from 'components/BasicDetailsCard';
import {ContractBasic} from './ContractBasic';
import {ContractParties} from './ContractParties';
import {ContractScope} from './ContractScope';
import {ContractPaymentDetails} from './ContractPaymentDetails';
import {ContractTimeline} from './ContractTimeline';
import {ContractCard} from './ContractCard';

export const ContractDetails = () => {
  const {id: contractId} = useParams();
  const theme = useTheme();
  const navigate = useNavigate();
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

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb="0.5em">
        <BackAction label="Contract Details" />
        <CustomButtonUnstyled
          label="Download Contract"
          size="small"
          startIcon={<FileDownloadIcon color="primary" />}
        />
      </Box>
      <Grid
        container
        spacing={2}
        sx={{
          pb: '1em',
        }}
      >
        <Grid xs={8} item>
          <BasicDetailsCard
            minHeight="12rem"
            containerStyles={{pt: '1em'}}
            header={
              <Box display="flex" justifyContent="space-between">
                <Typography variant="subtitle1">#CNT000128</Typography>
                <StatusChip
                  color="success"
                  label="In Effect"
                  textColor={theme.palette.success.main}
                  bgColor={theme.palette.success.outlinedHoverBg}
                />
              </Box>
            }
          >
            <ContractBasic
              startTime={contractDetails?.startTime}
              endTime={contractDetails?.endTime}
              costPerYear={contractDetails?.price}
              type={contractDetails?.type.toLowerCase()}
            />
          </BasicDetailsCard>

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
                  arrow
                >
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
            }
          >
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
                  arrow
                >
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
            }
          >
            <ContractParties
              companyName={contractDetails?.propertyOwner.address.fullName}
              personName={contractDetails?.serviceCompany.name}
              email={contractDetails?.serviceCompany.contact.email}
              partyRole={contractDetails?.serviceCompany.role}
              partyType="Contractor"
              chipColor="info"
              chipTextColor={theme.palette.info.main}
              chipBgColor={theme.palette.info.outlinedHoverBg}
            />
            <ContractParties
              companyName={contractDetails?.propertyOwner.address.fullName}
              personName={contractDetails?.propertyOwner.name}
              email={contractDetails?.propertyOwner.contact.email}
              partyRole={contractDetails?.propertyOwner.role}
              partyType="Customer"
              chipColor="info"
              chipTextColor={theme.palette.info.main}
              chipBgColor={theme.palette.info.outlinedHoverBg}
              containerStyle={{mt: '3em'}}
            />
          </ContractCard>
        </Grid>
        <Grid xs={4} item>
          <ContractCard
            containerStyles={{minHeight: '26vh', py: '1em'}}
            header={
              <Typography variant="subtitle1">Contract Timeline</Typography>
            }
          >
            {unUsedContractDays > 0 && unUsedContractDays <= 30 ? (
              <Alert
                variant="filled"
                severity="warning"
                sx={{
                  mb: '1em',
                  background: theme.palette.warning.outlinedHoverBg,
                  color: theme.palette.warning.main,
                }}
              >
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

          <ContractCard
            minHeight="25vh"
            containerStyles={{mt: '1em', py: '1em'}}
            header={
              <Typography variant="subtitle1">Payment Details</Typography>
            }
          >
            <ContractPaymentDetails
              name={contractDetails?.propertyOwner.name}
            />
          </ContractCard>
        </Grid>
      </Grid>
    </Box>
  );
};
