import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {FormLabel} from 'components/form/FormLabel';
import {PageCard} from 'components/PageCard';
import {ServiceOrderIcons} from 'components/ServiceOrderIcons';
import {ServiceOrderTypeText} from 'components/ServiceOrderTypeText';
import {StatusChip} from 'components/StatusChip';
import {useFormatDate} from 'hooks/useFormatDate';
import {ServiceOrderStatus, ServiceOrderType} from 'models/service-order';
import {
  getServiceOrderStatusColor,
  serviceOrderStatusToString,
} from 'utils/service-order-utils';

interface Props {
  date: string;
  type: ServiceOrderType;
  number: string;
  status: ServiceOrderStatus;
}

export const ReportCard = ({date, type, number, status}: Props) => {
  const formatDate = useFormatDate();
  return (
    <PageCard
      contentContainerStyles={{
        display: 'flex',
        gap: '2em',
        justifyContent: 'space-between',
      }}>
      <Box>
        <FormLabel text="Date" sx={{display: 'block'}} />
        <Typography variant="subtitle1">{formatDate(date)}</Typography>
      </Box>
      <Box>
        <FormLabel text="Type" sx={{display: 'block'}} />
        <Box display="flex" alignItems="center" gap=".5em">
          <ServiceOrderIcons serviceOrderType={type} size="small" />
          <ServiceOrderTypeText
            serviceOrderType={type}
            capitalizeText
            variant="subtitle1"
          />
        </Box>
      </Box>
      <Box>
        <FormLabel text="Order ID" sx={{display: 'block'}} />
        <Typography variant="subtitle1">{number}</Typography>
      </Box>
      <Box>
        <FormLabel text="Status" sx={{display: 'block'}} />
        <StatusChip
          color={getServiceOrderStatusColor(status)}
          label={serviceOrderStatusToString(status)}
        />
      </Box>
    </PageCard>
  );
};
