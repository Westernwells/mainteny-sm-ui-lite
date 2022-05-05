import Box, {BoxProps} from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {ServiceOrderIcons} from 'components/ServiceOrderIcons';
import {ServiceOrderType, ServiceOrderView} from 'models/service-order';
import {CustomButtonUnstyled} from 'components/CustomButtonUnstyled';
import {formatDistance} from 'date-fns';
import Divider from '@mui/material/Divider';

interface Props extends BoxProps {
  serviceOrder: ServiceOrderView;
}

export const OrderDetails = ({serviceOrder, ...rest}: Props) => (
  <Box sx={{mt: '0.5em', px: '0.5em'}} {...rest}>
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
      }}>
      <Box sx={{display: 'flex'}}>
        <ServiceOrderIcons
          serviceOrderType={serviceOrder.type}
          style={{width: '1.14rem', height: '1.02rem', mt: '0.1em'}}
        />
        <Typography
          variant="smallBtnText"
          color={
            serviceOrder.type === ServiceOrderType.EMERGENCY
              ? 'error'
              : 'primary'
          }
          sx={{textTransform: 'capitalize', ml: '0.5em'}}>
          {serviceOrder.type}
        </Typography>
      </Box>
      <Typography variant="caption">
        Due in {formatDistance(new Date(serviceOrder.dueDate), new Date())}
      </Typography>
    </Box>
    <Typography variant="body2" component="div" mt="0.5em">
      {serviceOrder.elevator.propertyOwner.name}
    </Typography>
    <Typography component="div" variant="caption" color="textSecondary">
      {serviceOrder.elevator.address.fullName}
    </Typography>

    <CustomButtonUnstyled
      label="Assign technician"
      size="small"
      style={{px: '0.5em', mt: '0.7em'}}
    />

    <Divider sx={{mt: '1.5em'}} />
  </Box>
);
