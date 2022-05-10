import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {useServiceOrderStatusColor} from 'hooks/useServiceOrderStatusColor';
import {ServiceOrderStatus} from 'models/service-order';
import {useRef} from 'react';
import {removeFromList} from 'utils/utils';
import {getServiceOrderStatusText} from 'utils/service-order-utils';

interface Props {
  containerStyles?: {[key: string]: string | number};
}

export const ServiceOrderStatusIndicator = ({containerStyles}: Props) => {
  const [serviceOrderStatusColor] = useServiceOrderStatusColor();
  const statuses = useRef(
    removeFromList(
      ['ALL', 'INIT', 'READY_TO_SCHEDULE', 'SCHEDULING'],
      Object.values(ServiceOrderStatus),
    ),
  ).current;

  return (
    <Box
      display="flex"
      mb="0.8em"
      justifyContent="flex-end"
      sx={{...containerStyles}}>
      {statuses.map((status: ServiceOrderStatus, index: number) => {
        const statusColor = status ? serviceOrderStatusColor[status] : null;
        return (
          <Box display="flex" key={index} mr="1em">
            <Box
              sx={{
                background: statusColor,
                height: '0.8rem',
                width: '0.8rem',
                borderRadius: '50%',
                mr: '0.5em',
                mb: '0.3em',
              }}
            />

            <Typography variant="chip">
              {getServiceOrderStatusText(status)}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};
