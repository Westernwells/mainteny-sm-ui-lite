import useTheme from '@mui/material/styles/useTheme';
import Grid from '@mui/material/Grid';
import {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {ContractStatus, ContractSimpleView} from 'models/contract';
import {useElevatorById} from 'hooks/reactQuery/useElevator';
import {Progress} from 'components/Progress';
import {Location} from './Location';
import General from './General';
import {Service} from './Service';
import {AppointmentPreference} from './AppointmentPreference';
import {EmergencyPhone} from './EmergencyPhone';
import {UnitContracts} from './UnitContracts';
import {PriorityTechnician} from './PriorityTechnician';
import {Pictures} from './Pictures';

interface Props {
  getUnitName?: (value: string) => void;
}

export const OverviewTab = ({getUnitName}: Props) => {
  const {id: elevatorId} = useParams();
  const theme = useTheme();

  const [validContract, setValidContract] = useState<ContractSimpleView>();

  const {data: elevator, isLoading: isLoadingElevator} =
    useElevatorById(elevatorId);

  useEffect(() => {
    if (getUnitName && elevator) {
      getUnitName(elevator?.address?.fullName ?? '');
    }
  }, [elevator]);

  useEffect(() => {
    if (elevator) {
      const result = elevator.contracts.filter(
        (item) => item.status === ContractStatus.VALID,
      );
      setValidContract(result[0]);
    }
  }, [elevator]);

  if (isLoadingElevator) {
    return <Progress />;
  }

  return (
    <>
      <Grid container spacing={2}>
        <Grid item md={6} sm={12}>
          <General
            elevator={elevator!}
            propertyOwnerId={elevator?.propertyOwner.id}
          />
        </Grid>
        <Grid item md={6} sm={12}>
          <Location
            propertyOwnerId={elevator?.propertyOwner.id}
            containerStyles={{
              [theme.breakpoints.up('md')]: {
                minHeight: '35rem',
                height: '100%',
              },
            }}
            elevator={elevator!}
          />
        </Grid>
      </Grid>

      <Grid
        container
        spacing={2}
        sx={{
          mt: '0.3em',
          [theme.breakpoints.up('md')]: {
            maxHeight: '27.5rem',
          },
        }}>
        <Grid
          item
          xs={12}
          md={4}
          sx={{
            [theme.breakpoints.up('md')]: {
              height: '100%',
            },
          }}>
          <Service
            containerStyles={{
              [theme.breakpoints.up('md')]: {
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              },
            }}
            elevator={elevator!}
            validContract={validContract}
            propertyOwnerId={elevator?.propertyOwner.id}
          />
        </Grid>
        <Grid
          item
          xs={12}
          md={4}
          sx={{
            [theme.breakpoints.up('md')]: {
              height: '100%',
            },
          }}>
          <AppointmentPreference
            containerStyles={{
              [theme.breakpoints.up('md')]: {
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              },
            }}
            elevator={elevator!}
            propertyOwnerId={elevator?.propertyOwner.id}
          />
        </Grid>
        <Grid
          item
          xs={12}
          md={4}
          sx={{
            [theme.breakpoints.up('md')]: {
              height: '100%',
            },
          }}>
          <EmergencyPhone
            containerStyles={{
              [theme.breakpoints.up('md')]: {
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              },
            }}
            elevator={elevator!}
            propertyOwnerId={elevator?.propertyOwner.id}
          />
        </Grid>
      </Grid>

      <UnitContracts
        contracts={elevatorId ? elevator!.contracts : []}
        containerStyles={{mt: '1.2em'}}
      />

      <PriorityTechnician
        containerStyles={{mt: '1.2em'}}
        elevatorId={elevator?.id}
        maintainers={elevator?.assignments}
      />

      <Grid
        container
        spacing={2}
        sx={{
          mt: '0.3em',
          [theme.breakpoints.up('md')]: {
            maxHeight: 500,
          },
        }}>
        <Grid
          item
          xs={12}
          md={12}
          sx={{
            [theme.breakpoints.up('md')]: {
              height: '100%',
            },
          }}>
          <Pictures
            elevator={elevator!}
            propertyOwnerId={elevator?.propertyOwner.id}
          />
        </Grid>
      </Grid>
    </>
  );
};
