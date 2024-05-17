import {useState} from 'react';
import useTheme from '@mui/material/styles/useTheme';

export const useServiceOrderStatusColor = () => {
  const theme = useTheme();
  const [serviceOrderTypeColor] = useState<{[key: string]: string}>({
    SCHEDULED: theme.palette.primary.main,
    IN_PROGRESS: theme.state.ratingActive,
    COMPLETED: theme.palette.success.main,
    CANCELLED: theme.palette.action.active,
    EXPIRED: theme.palette.error.main,
    OVERDUE: theme.palette.error.main,
    READY_TO_SCHEDULE: theme.palette.warning.main,
  });

  return [serviceOrderTypeColor];
};
