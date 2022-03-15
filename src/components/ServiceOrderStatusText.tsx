import Typography from '@mui/material/Typography';
import useTheme from '@mui/material/styles/useTheme';
import {ServiceOrderStatus} from '../models/service-order';

interface Props {
  serviceOrderStatus?: ServiceOrderStatus;
  style?: {[key: string]: string | number};
  color?: any;
}
export const ServiceOrderStatusText = ({
  serviceOrderStatus,
  style,
  color,
}: Props) => {
  const theme = useTheme();
  const renderStatus = () => {
    switch (serviceOrderStatus) {
      case ServiceOrderStatus.COMPLETED:
        return 'Completed';
      case ServiceOrderStatus.SCHEDULED:
        return 'Pending';
      case ServiceOrderStatus.IN_PROGRESS:
        return 'In Progress';
      case ServiceOrderStatus.EXPIRED:
        return 'Expired';
      case ServiceOrderStatus.CANCELLED:
        return 'Cancelled';
      default:
        return 'Pending';
    }
  };

  return (
    <Typography
      variant="chip"
      color={theme.palette.text.secondary || color}
      sx={{textTransform: 'capitalize', ...style}}>
      {renderStatus()}
    </Typography>
  );
};
