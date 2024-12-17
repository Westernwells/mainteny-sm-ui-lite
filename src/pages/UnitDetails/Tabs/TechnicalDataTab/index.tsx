import Grid from '@mui/material/Grid';
import {Progress} from 'components/Progress';
import {useElevatorById} from 'hooks/reactQuery/useElevator';
import {useParams} from 'react-router-dom';
import {useFetchElevatorDataSchemas} from 'hooks/reactQuery/useCompanies';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {makePage} from 'utils/paging';
import TechnicalData from './TechnicalData';

const TechnicalDataTab = () => {
  const {id: elevatorId} = useParams();
  const {user} = useUserSession();
  const {data: elevatorDataSchemaResource} = useFetchElevatorDataSchemas(
    user?.userAccount.serviceCompany.id!,
    {
      ...makePage(0, 100),
    },
  );

  const {data: elevator, isLoading: isLoadingElevator} =
    useElevatorById(elevatorId);

  if (isLoadingElevator) {
    return <Progress />;
  }

  return (
    <Grid container spacing={2}>
      {elevatorDataSchemaResource?.data.map((schema) => (
        <Grid key={schema.id} item md={4} sm={6} xs={12}>
          <TechnicalData schema={schema} elevator={elevator!} />
        </Grid>
      ))}
    </Grid>
  );
};

export default TechnicalDataTab;
