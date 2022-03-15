import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useTheme from '@mui/material/styles/useTheme';
import {ServiceOrderStatus, ServiceOrderType} from 'models/service-order';

import {ServiceOrderIcons} from 'components/ServiceOrderIcons';
import {ServiceOrderTypeText} from 'components/ServiceOrderTypeText';
import {ServiceOrderStatusText} from 'components/ServiceOrderStatusText';
import {ServiceOrderStatusIcons} from 'components/ServiceOrderStatusIcons';

interface Props {
  isDetailCard?: boolean;
  removeServiceOrderType?: boolean;
  removeServiceOrderStatus?: boolean;
  headerTitle?: string | null;
  subtitle?: string | null;
  serviceOrderType?: ServiceOrderType;
  serviceOrderStatus?: ServiceOrderStatus;
}

export const HistoryCardHeader = ({
  isDetailCard,
  removeServiceOrderType,
  removeServiceOrderStatus,
  headerTitle,
  subtitle,
  serviceOrderType,
  serviceOrderStatus,
}: Props) => {
  const theme = useTheme();
  return (
    <Box display="flex" justifyContent="space-between">
      <Box display="flex">
        <Box mr="1em">
          <Typography variant="subtitle1" sx={{mr: '0.4em'}}>
            {headerTitle || ''}
          </Typography>
          {isDetailCard ? (
            <Typography
              variant="body2"
              sx={{mr: '0.4em', color: theme.palette.text.secondary}}>
              {subtitle || ''}
            </Typography>
          ) : null}
        </Box>
        {!isDetailCard ? (
          <Box display="flex">
            <Box sx={{mt: '0.2em'}}>
              <ServiceOrderIcons
                serviceOrderType={serviceOrderType}
                style={{
                  width: '0.8em',
                  height: '0.8em',
                  marginRight: '0.3em',
                }}
              />
            </Box>
            <Box>
              <ServiceOrderTypeText serviceOrderType={serviceOrderType} />
            </Box>
          </Box>
        ) : null}
      </Box>

      <Box display="flex">
        {isDetailCard && !removeServiceOrderType ? (
          <Box display="flex" mr="1em">
            <Box mt="0.1em">
              <ServiceOrderIcons
                serviceOrderType={serviceOrderType}
                style={{
                  width: '0.8em',
                  height: '0.8em',
                  marginRight: '0.3em',
                }}
              />
            </Box>
            <Box>
              <ServiceOrderTypeText serviceOrderType={serviceOrderType} />
            </Box>
          </Box>
        ) : null}
        {!removeServiceOrderStatus ? (
          <Box mr="0.4em">
            <ServiceOrderStatusText serviceOrderStatus={serviceOrderStatus} />
          </Box>
        ) : null}

        {!removeServiceOrderStatus ? (
          <Box mt="0.1em">
            <ServiceOrderStatusIcons serviceOrderStatus={serviceOrderStatus} />
          </Box>
        ) : null}
      </Box>
    </Box>
  );
};
