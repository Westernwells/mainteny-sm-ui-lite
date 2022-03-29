import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useTheme from '@mui/material/styles/useTheme';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {ServiceOrderType} from 'models/service-order';

import {ServiceOrderIcons} from 'components/ServiceOrderIcons';

interface Props {
  isDetailCard?: boolean;
  removeServiceOrderType?: boolean;
  removeServiceOrderStatus?: boolean;
  headerTitle?: string;
  subtitle?: string;
}

export const HistoryCardHeader = ({
  isDetailCard,
  removeServiceOrderType,
  removeServiceOrderStatus,
  headerTitle,
  subtitle,
}: Props) => {
  const theme = useTheme();
  return (
    <Box display="flex" justifyContent="space-between">
      <Box display="flex">
        <Box mr="1em">
          <Typography variant="subtitle1" sx={{mr: '0.4em'}}>
            {headerTitle || '24 Sep 2021'}
          </Typography>
          {isDetailCard ? (
            <Typography
              variant="body2"
              sx={{mr: '0.4em', color: theme.palette.text.secondary}}>
              {subtitle || '5:30 PM to 6:30 PM'}
            </Typography>
          ) : null}
        </Box>
        {!isDetailCard ? (
          <Box display="flex">
            <Box>
              <ServiceOrderIcons
                serviceOrderType={ServiceOrderType.REGULAR}
                style={{
                  width: '0.8em',
                  height: '0.8em',
                  marginRight: '0.3em',
                  mt: '0.2em',
                }}
              />
            </Box>
            <Box>
              <Typography variant="caption">MAINTENANCE</Typography>
            </Box>
          </Box>
        ) : null}
      </Box>

      <Box display="flex">
        {isDetailCard && !removeServiceOrderType ? (
          <Box display="flex" mr="1em">
            <Box>
              <ServiceOrderIcons
                serviceOrderType={ServiceOrderType.REGULAR}
                style={{
                  width: '0.8em',
                  height: '0.8em',
                  marginRight: '0.3em',
                  mt: '0.2em',
                }}
              />
            </Box>
            <Box>
              <Typography variant="caption">MAINTENANCE</Typography>
            </Box>
          </Box>
        ) : null}
        {!removeServiceOrderStatus ? (
          <Box mr="0.4em">
            <Typography
              variant="chip"
              color={theme.palette.text.secondary}
              sx={{textTransform: 'capitalize'}}>
              Completed
            </Typography>
          </Box>
        ) : null}

        {!removeServiceOrderStatus ? (
          <Box>
            <CheckCircleIcon
              color="success"
              sx={{mt: '0.3em', height: '0.833rem', width: '0.833rem'}}
            />
          </Box>
        ) : null}
      </Box>
    </Box>
  );
};
