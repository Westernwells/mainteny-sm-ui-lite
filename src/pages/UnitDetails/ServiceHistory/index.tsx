import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useTheme from '@mui/material/styles/useTheme';
import {ServiceOrderView} from 'models/service-order';
import {ServiceOrderIcons} from 'components/ServiceOrderIcons';
import Grid from '@mui/material/Grid';
import {formatDate} from 'utils/datetime';
import {ServiceOrderStatusIcons} from 'components/ServiceOrderStatusIcons';
// import {ServiceOrderStatusText} from 'components/ServiceOrderStatusText';
import {ServiceOrderTypeText} from 'components/ServiceOrderTypeText';
import {serviceOrderStatusToString} from 'utils/service-order-utils';

interface Props {
  bodyContainerStyle?: {[key: string]: string | number};
  minHeight?: number | string;
  serviceOrder: ServiceOrderView;
}

export const ServiceHistory = ({
  bodyContainerStyle,
  minHeight,
  serviceOrder,
}: Props) => {
  const theme = useTheme();
  console.log(minHeight);
  return (
    <Grid
      container
      sx={{
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        pt: '1.5em',
        pb: '0.5em',
        ...bodyContainerStyle,
      }}>
      <Grid xs={3} item>
        <Box display="flex">
          <Typography variant="subtitle1" sx={{mr: '0.3em'}}>
            {formatDate(serviceOrder.schedules[0].startTime, 'dd MMM YYY')},
          </Typography>
          <Typography
            variant="body2"
            sx={{mt: '0.35em', color: theme.palette.text.secondary}}>
            {`${formatDate(
              serviceOrder.schedules[0].startTime,
              'ha',
            )} - ${formatDate(serviceOrder.schedules[0].endTime, 'ha')}`}
          </Typography>
        </Box>
      </Grid>
      <Grid xs={2} item>
        <Box display="flex">
          <Box sx={{mt: '0.2em', mr: '0.3em'}}>
            <ServiceOrderIcons
              serviceOrderType={serviceOrder.type}
              size="small"
            />
          </Box>
          <Box>
            <ServiceOrderTypeText serviceOrderType={serviceOrder.type} />
          </Box>
        </Box>
      </Grid>

      <Grid xs={5} item>
        <Typography variant="caption">{serviceOrder.description}</Typography>
      </Grid>

      <Grid xs={2} item>
        <Box display="flex" justifyContent="flex-end">
          <Box mr="0.4em">
            <Typography variant="chip">
              {serviceOrderStatusToString(serviceOrder.status)}
            </Typography>
          </Box>
          <Box>
            <ServiceOrderStatusIcons serviceOrderStatus={serviceOrder.status} />
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};
