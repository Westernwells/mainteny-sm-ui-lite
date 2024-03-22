import Grid from '@mui/material/Grid';
import {Progress} from 'components/Progress';
import {useElevatorById} from 'hooks/reactQuery/useElevator';
import {useParams} from 'react-router-dom';
import TechnicalData from './TechnicalData';
import AutoDialer from './AutoDialer';

const TechnicalDataTab = () => {
  const {id: elevatorId} = useParams();

  const {data: elevator, isLoading: isLoadingElevator} =
    useElevatorById(elevatorId);

  if (isLoadingElevator) {
    return <Progress />;
  }

  return (
    <Grid container spacing={2}>
      <Grid item md={6} sm={12}>
        <TechnicalData elevator={elevator!} />
      </Grid>
      <Grid item md={6} sm={12}>
        <AutoDialer elevator={elevator!} />
      </Grid>
    </Grid>
  );
};

export default TechnicalDataTab;
