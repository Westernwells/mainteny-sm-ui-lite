import {Box, Typography} from '@mui/material';
import {Progress} from 'components/Progress';
import {ServiceOrderIcons} from 'components/ServiceOrderIcons';
import {ServiceOrderTypeText} from 'components/ServiceOrderTypeText';
import {StatusChip} from 'components/StatusChip';
import {useServiceOrderDetails} from 'hooks/reactQuery/useServiceOrder';
import {useFormatDate} from 'hooks/useFormatDate';
import {useTranslation} from 'react-i18next';
import {
  getServiceOrderStatusColor,
  serviceOrderStatusToString,
} from 'utils/service-order-utils';
import useTheme from '@mui/material/styles/useTheme';
import DOMPurify from 'dompurify';

interface Props {
  serviceOrderId: string;
}

export const ServiceOrderDetails = ({serviceOrderId}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const formatDate = useFormatDate();
  const {data: serviceOrder, isLoading} =
    useServiceOrderDetails(serviceOrderId);

  if (isLoading)
    return (
      <Box height="8em">
        <Progress height="3em" />
      </Box>
    );

  return (
    <>
      <Box display="flex" justifyContent="space-between" width="100%">
        <Box>
          <Typography variant="caption" sx={{color: 'text.main'}}>
            {t('Job Number')}
          </Typography>
          <Typography
            variant="caption"
            component="div"
            color={theme.palette.primary.mainLight}
            sx={{
              fontSize: '0.9rem',
              fontWeight: '400',
              p: '0.2em 0em 0.5em 0em',
            }}>
            {serviceOrder?.number}
          </Typography>
          <Typography
            sx={{color: 'text.secondary', fontSize: '0.7rem'}}
            display="block"
            mt="-0.25rem">
            {t('Created on {{creationDate}}', {
              creationDate: formatDate(serviceOrder?.meta.createdAt),
            })}
          </Typography>
        </Box>
        {serviceOrder && (
          <StatusChip
            color={getServiceOrderStatusColor(serviceOrder.status)}
            label={serviceOrderStatusToString(serviceOrder.status)}
          />
        )}
      </Box>
      {serviceOrder && (
        <Box
          display="flex"
          width="100%"
          alignItems="center"
          gap=".2em"
          mt="1em">
          <ServiceOrderIcons
            serviceOrderType={serviceOrder.type}
            size="small"
          />
          <ServiceOrderTypeText
            serviceOrderType={serviceOrder.type}
            capitalizeText
          />
        </Box>
      )}

      <Typography
        variant="caption"
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(serviceOrder?.description!),
        }}
      />
    </>
  );
};
