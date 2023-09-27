import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Close from '@mui/icons-material/Close';
import AccessTimeFilled from '@mui/icons-material/AccessTimeFilled';
import LocationOn from '@mui/icons-material/LocationOn';
import {useNavigate} from 'react-router-dom';
import {useFormatDate} from 'hooks/useFormatDate';
import {ServiceOrderView} from 'models/service-order';
import useTheme from '@mui/material/styles/useTheme';
import {Button} from './Button';

export interface Props {
  order: ServiceOrderView;
  close: () => void;
}

export const OrderDetails = ({order, close}: Props) => {
  const navigate = useNavigate();
  const formatDate = useFormatDate();
  const theme = useTheme();
  const startTime = formatDate(order.schedules[0].startTime, 'HH:mm');
  const endTime = formatDate(order.schedules[0].endTime, 'HH:mm');
  const date = formatDate(order.schedules[0].startTime);
  const day = formatDate(order.schedules[0].startTime, 'cccc');

  const basic = (
    icon: JSX.Element,
    title?: string,
    subtitle?: string,
    containerStyles?: {[key: string]: string | number},
  ) => (
    <Box sx={{display: 'flex', pt: '1.28em', ...containerStyles}}>
      <Box>{icon}</Box>
      <Box>
        <Typography variant="chip" color={theme.palette.text.primary}>
          {title || null}
        </Typography>

        <Typography
          variant="chip"
          component="div"
          color={theme.palette.text.secondary}
          mt="0.6em">
          {subtitle || null}
        </Typography>
      </Box>
    </Box>
  );
  return (
    <Box sx={{background: '#fff'}}>
      <Grid container justifyContent="space-between">
        <Typography
          variant="subtitle2"
          color="primary"
          textTransform="capitalize">
          {order.elevator.propertyOwner.name}
        </Typography>

        <IconButton aria-label="close" sx={{padding: 0}} onClick={close}>
          <Close
            sx={{
              fontSize: '0.875em',
              color: theme.palette.text.secondary,
            }}
          />
        </IconButton>
      </Grid>

      {basic(
        <AccessTimeFilled
          sx={{
            fontSize: '1.64em',
            mr: '0.594em',
            mt: '0.25em',
            color: theme.palette.text.secondary,
          }}
        />,
        `${startTime} to ${endTime}`,
        `${date} ${day}`,
      )}
      {basic(
        <LocationOn
          sx={{
            fontSize: '1.64em',
            mr: '0.594em',
            mt: '0.25em',
            color: theme.palette.text.secondary,
          }}
        />,
        order.elevator.address?.fullName ?? '',
      )}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: '0.5em',
        }}
        component="span">
        <Button
          label="View Details"
          buttonProps={{
            variant: 'contained',
            size: 'small',
            sx: {
              textTransform: 'capitalize',
              px: '2em',
              width: '85%',
            },
            onClick: () => navigate(`/orders/details/${order.id}`),
          }}
        />
      </Box>
    </Box>
  );
};
