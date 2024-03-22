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
import {PriorityTechnician} from './PriorityTechnician';
import {Pictures} from './Pictures';
import ContractServices from './ContractServices';

interface Props {
  getUnitName?: (value: string) => void;
}

export const OverviewTab = ({getUnitName}: Props) => {
  const {id: elevatorId} = useParams();

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
      <Grid container spacing={2} sx={{display: 'flex', alignItems: 'stretch'}}>
        <Grid item md={6} sm={12}>
          <General
            containerStyles={{height: '100%'}}
            elevator={elevator!}
            propertyOwnerId={elevator?.propertyOwner.id}
          />
        </Grid>
        <Grid item md={6} sm={12}>
          <Location
            propertyOwnerId={elevator?.propertyOwner.id}
            elevator={elevator!}
          />
        </Grid>
      </Grid>

      <Grid
        container
        spacing={2}
        mt="0.3em"
        sx={{display: 'flex', alignItems: 'stretch'}}>
        <Grid item xs={12} md={6}>
          <Service
            containerStyles={{height: '100%'}}
            elevator={elevator!}
            validContract={validContract}
            propertyOwnerId={elevator?.propertyOwner.id}
          />
        </Grid>
        <Grid item md={6} sm={12}>
          <AppointmentPreference
            elevator={elevator!}
            propertyOwnerId={elevator?.propertyOwner.id}
          />
        </Grid>
      </Grid>

      <ContractServices elevator={elevator!} containerStyles={{mt: '1.2em'}} />

      <PriorityTechnician
        containerStyles={{mt: '1.2em'}}
        elevatorId={elevator?.id}
        maintainers={elevator?.assignments}
      />

      <Grid container spacing={2} mt="0.3em">
        <Grid item xs={12} md={12}>
          <Pictures
            elevator={elevator!}
            propertyOwnerId={elevator?.propertyOwner.id}
          />
        </Grid>
      </Grid>
    </>
  );
};
