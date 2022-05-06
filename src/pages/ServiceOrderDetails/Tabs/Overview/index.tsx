import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import {useServiceOrderDetails} from 'hooks/reactQuery/useServiceOrder';
import {useParams} from 'react-router';
import {Progress} from 'components/Progress';
import {OrderInfoCard} from './OrderInfoCard';
import {UnitInfoCard} from './UnitInfoCard';

export const Overview = () => {
  console.log('');
  const {id: orderId} = useParams();
  const {data: serviceOrderDetails, isLoading} =
    useServiceOrderDetails(orderId);

  if (isLoading) {
    return <Progress />;
  }
  return (
    <Grid>
      <Grid item xs={8}>
        <OrderInfoCard serviceOrderDetails={serviceOrderDetails!} />
        <Box mt="1em">
          <UnitInfoCard serviceOrderDetails={serviceOrderDetails!} />
        </Box>
      </Grid>
    </Grid>
  );
};
