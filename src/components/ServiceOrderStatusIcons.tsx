import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PublishedWithChangesIcon from '@mui/icons-material/PublishedWithChanges';
import PendingIcon from '@mui/icons-material/Pending';
import {ServiceOrderStatus} from '../models/service-order';

interface Props {
  serviceOrderStatus?: ServiceOrderStatus;
  style?: {[key: string]: string | number};
}
export const ServiceOrderStatusIcons = ({serviceOrderStatus, style}: Props) => {
  switch (serviceOrderStatus) {
    case ServiceOrderStatus.COMPLETED:
      return (
        <CheckCircleIcon
          color="success"
          sx={{mt: '0.3em', height: '0.833rem', width: '0.833rem', ...style}}
        />
      );
    case ServiceOrderStatus.SCHEDULED:
      return (
        <PendingIcon
          color="warning"
          sx={{mt: '0.3em', height: '0.833rem', width: '0.833rem', ...style}}
        />
      );
    case ServiceOrderStatus.IN_PROGRESS:
      return (
        <PublishedWithChangesIcon
          color="warning"
          sx={{mt: '0.3em', height: '0.833rem', width: '0.833rem', ...style}}
        />
      );
    case ServiceOrderStatus.OVERDUE:
      return (
        <WarningAmberIcon
          color="warning"
          sx={{mt: '0.3em', height: '0.833rem', width: '0.833rem', ...style}}
        />
      );
    case ServiceOrderStatus.CANCELLED:
      return (
        <CancelIcon
          color="error"
          sx={{mt: '0.3em', height: '0.833rem', width: '0.833rem', ...style}}
        />
      );

    default:
      return null;
  }
};
