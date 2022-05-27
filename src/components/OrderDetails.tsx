import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import {formatDate} from 'utils/datetime';
import {ServiceOrderView} from 'models/service-order';
import useTheme from '@mui/material/styles/useTheme';
import {Button} from './Button';

interface Props {
  order: ServiceOrderView;
}

export const OrderDetails = ({order}: Props) => {
  const theme = useTheme();
  const startTime = formatDate(order.schedules[0].startTime, 'HH:mm');
  const endTime = formatDate(order.schedules[0].endTime, 'HH:mm');
  const date = formatDate(order.schedules[0].startTime, 'dd MMMM');
  const day = formatDate(order.schedules[0].startTime, 'cccc');

  const basic = (
    icon: JSX.Element,
    title?: string,
    subtitle?: string,
    containerStyles?: {[key: string]: string | number},
  ) => (
    <Box sx={{display: 'flex', mt: '2em', ...containerStyles}}>
      <Box>{icon}</Box>
      <Box sx={{mt: '0.2em'}}>
        <Typography
          variant="chip"
          component="div"
          color={theme.palette.text.primary}>
          {title || null}
        </Typography>

        <Typography
          variant="chip"
          component="div"
          color="textSecondary"
          mt="0.8em">
          {subtitle || null}
        </Typography>
      </Box>
    </Box>
  );
  return (
    <Box
      sx={{
        background: '#fff',
        boxShadow: '0px 4px 9px rgba(0, 0, 0, 0.09)',
        p: '1em',
      }}>
      <Typography
        variant="subtitle1"
        color="primary"
        textTransform="capitalize">
        {order.elevator.propertyOwner.name}
      </Typography>

      {basic(
        <AccessTimeIcon
          sx={{
            fontSize: '0.9rem',
            mr: '0.3em',
            color: theme.palette.text.secondary,
          }}
        />,
        `${startTime} to ${endTime}`,
        `${date} ${day}`,
        {mt: '1em'},
      )}
      {basic(
        <LocationOnOutlinedIcon
          sx={{
            fontSize: '0.9rem',
            mr: '0.3em',
            color: theme.palette.text.secondary,
          }}
        />,
        order.elevator.address.fullName,
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
            },
          }}
        />
      </Box>
    </Box>
  );
};
