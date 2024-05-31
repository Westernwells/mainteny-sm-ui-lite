import Typography, {TypographyProps} from '@mui/material/Typography';
import useTheme from '@mui/material/styles/useTheme';
import Box from '@mui/material/Box';
import {useServiceOrderStatusColor} from 'hooks/useServiceOrderStatusColor';
import {ServiceOrderStatus} from '../models/service-order';

interface Props extends TypographyProps {
  serviceOrderStatus?: ServiceOrderStatus;
  style?: {[key: string]: string | number};
  color?: any;
  showLeftAdornment?: boolean;
}
export const ServiceOrderStatusText = ({
  serviceOrderStatus,
  style,
  color,
  showLeftAdornment,
  ...rest
}: Props) => {
  const theme = useTheme();
  const [serviceOrderStatusColor] = useServiceOrderStatusColor();
  const renderStatus = () => {
    const statusColor = serviceOrderStatus
      ? serviceOrderStatusColor[serviceOrderStatus]
      : null;
    switch (serviceOrderStatus) {
      case ServiceOrderStatus.COMPLETED:
        return (
          <Box display="flex">
            {showLeftAdornment ? (
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
            ) : null}

            <Typography variant="chip" {...rest}>
              Completed
            </Typography>
          </Box>
        );
      case ServiceOrderStatus.SCHEDULED:
        return (
          <Box display="flex">
            {showLeftAdornment ? (
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
            ) : null}
            <Typography variant="chip" {...rest}>
              Pending
            </Typography>
          </Box>
        );
      case ServiceOrderStatus.IN_PROGRESS:
        return (
          <Box display="flex">
            {showLeftAdornment ? (
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
            ) : null}
            <Typography variant="chip" {...rest}>
              In Progress
            </Typography>
          </Box>
        );
      case ServiceOrderStatus.OVERDUE:
        return (
          <Box display="flex">
            {showLeftAdornment ? (
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
            ) : null}
            <Typography variant="chip" {...rest}>
              Overdue
            </Typography>
          </Box>
        );
      case ServiceOrderStatus.CANCELLED:
        return (
          <Box display="flex">
            {showLeftAdornment ? (
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
            ) : null}
            <Typography variant="chip" {...rest}>
              Cancelled
            </Typography>
          </Box>
        );
      case ServiceOrderStatus.TECHNICIAN_ASSIGNED:
        return (
          <Box display="flex">
            {showLeftAdornment ? (
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
            ) : null}
            <Typography variant="chip" {...rest}>
              Assigned
            </Typography>
          </Box>
        );
      case ServiceOrderStatus.TRAVEL:
        return (
          <Box display="flex">
            {showLeftAdornment ? (
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
            ) : null}
            <Typography variant="chip" {...rest}>
              Travel
            </Typography>
          </Box>
        );
      case ServiceOrderStatus.PAUSED:
        return (
          <Box display="flex">
            {showLeftAdornment ? (
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
            ) : null}
            <Typography variant="chip" {...rest}>
              Paused
            </Typography>
          </Box>
        );
      case ServiceOrderStatus.ARTICLES_ORDERED:
        return (
          <Box display="flex">
            {showLeftAdornment ? (
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
            ) : null}
            <Typography variant="chip" {...rest}>
              Articles Ordered
            </Typography>
          </Box>
        );
      default:
        return (
          <Box display="flex">
            {showLeftAdornment ? (
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
            ) : null}
            <Typography variant="chip" {...rest}>
              Pending
            </Typography>
          </Box>
        );
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
