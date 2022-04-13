import {useState} from 'react';
import useTheme from '@mui/material/styles/useTheme';
import {grey} from '@mui/material/colors';

export const useServiceOrderTypeColor = () => {
  const theme = useTheme();
  const [serviceOrderTypeColor] = useState<{[key: string]: string}>({
    SCHEDULED: '#00D1FF',
    IN_PROGRESS: theme.state?.ratingActive as string,
    COMPLETED: theme.palette.success.main,
    CANCELLED: grey[600],
    EXPIRED: theme.palette.error.main,
  });

  return [serviceOrderTypeColor];
};
