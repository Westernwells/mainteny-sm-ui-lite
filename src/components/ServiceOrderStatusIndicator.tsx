import Box from '@mui/material/Box';
import {ServiceOrderStatus} from 'models/service-order';
import {useRef} from 'react';
import {removeFromArray} from 'utils/utils';
import {ServiceOrderStatusText} from './ServiceOrderStatusText';

export const ServiceOrderStatusIndicator = () => {
  const statuses = useRef(
    removeFromArray(
      ['ALL', 'INIT', 'READY_TO_SCHEDULE', 'SCHEDULING'],
      Object.values(ServiceOrderStatus),
    ),
  ).current;
  return (
    <Box display="flex" mb="0.8em" justifyContent="flex-end">
      {statuses.map((status) => (
        <ServiceOrderStatusText
          serviceOrderStatus={status}
          showLeftAdornment
          sx={{mr: '1em'}}
        />
      ))}
    </Box>
  );
};
