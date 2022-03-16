import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import useTheme from '@mui/material/styles/useTheme';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import LockClockIcon from '@mui/icons-material/LockClock';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import IconButton, {IconButtonProps} from '@mui/material/IconButton';
import {CardAlert} from 'components/CardAlert';
import {CardProps} from 'components/CardProps';
import Collapse from '@mui/material/Collapse';
import CardActions from '@mui/material/CardActions';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {styled} from '@mui/material/styles';
import {
  ServiceOrderReport,
  ServiceOrderStatus,
  ServiceOrderView,
} from 'models/service-order';
// import {MaintenanceBasicInfo} from './ServiceBasicInfo';
import {formatDistance, isAfter, isToday} from 'date-fns';
import {calculateNextVisitDate} from 'pages/Units/Models';
import {useEffect, useState} from 'react';
import {HistoryCardHeader} from './HistoryCardHeader';
import {HitoryCardEmptyState} from './HitoryCardEmptyState';

interface Props {
  bodyContainerStyle?: {[key: string]: string | number};
  containerStyles?: {[key: string]: string | number};
  showTimeCategory?: boolean;
  isDetailCard?: boolean;
  headerActionIcon?: JSX.Element;
  minHeight?: string | number;
  removeShadows?: boolean;
  removeTopLeftRadius?: boolean;
  removeTopRightRadius?: boolean;
  removeBottomLeftRadius?: boolean;
  removeBottomRightRadius?: boolean;
  removeServiceOrderType?: boolean;
  removeServiceOrderStatus?: boolean;
  headerTitle?: string | null;
  subtitle?: string | null;
  showMoreReportDetails?: boolean;
  showAlert?: boolean;
  collapsedChildren?: JSX.Element | null;
  expanded?: boolean;
  handleExpandClick?: () => void;
  showActionSection?: true;
  showPointer?: boolean;
  selected?: boolean;
  onCardSelect?: () => void;
  serviceOrder?: ServiceOrderView;
  serviceOrderReport?: ServiceOrderReport;
  description?: string;
  noContent?: boolean;
  reportIsLoading?: boolean;
  scheduledTime?: string;
}

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
  const {expand, ...other} = props;
  console.log(expand);
  return <IconButton {...other} />;
})(({theme, expand}) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

export const HistoryCard = ({
  bodyContainerStyle,
  showTimeCategory,
  isDetailCard,
  headerActionIcon,
  minHeight,
  removeShadows,
  removeTopLeftRadius,
  removeTopRightRadius,
  removeBottomLeftRadius,
  removeBottomRightRadius,
  containerStyles,
  removeServiceOrderType,
  removeServiceOrderStatus,
  headerTitle,
  subtitle,
  showMoreReportDetails,
  showAlert,
  showActionSection,
  collapsedChildren = null,
  expanded = false,
  handleExpandClick = () => {},
  showPointer,
  selected,
  onCardSelect = () => {},
  serviceOrder,
  serviceOrderReport,
  description,
  noContent,
  reportIsLoading,
  scheduledTime,
}: Props) => {
  const theme = useTheme();
  const [duration, setDuration] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (serviceOrderReport) {
      const timeString = serviceOrderReport
        ? serviceOrderReport.actualServiceTime / 60
        : 0;
      const date = new Date(0, 0);
      date.setMinutes(+timeString * 60);

      const d = date.toTimeString().slice(0, 5).split(':');
      setDuration(d);
    }
  }, [serviceOrderReport]);

  useEffect(() => {
    if (serviceOrder) {
      let msg = '';
      const serviceDate = new Date(serviceOrder!.schedules[0].startTime);
      const technician = `${serviceOrder?.schedules[0].technician.userAccount.firstName} ${serviceOrder?.schedules[0].technician.userAccount.lastName}`;
      if (isAfter(serviceDate, new Date())) {
        msg = `${technician} will be visiting your location in ${formatDistance(
          calculateNextVisitDate(serviceOrder?.schedules[0].startTime!),
          new Date(),
        )}`;
      } else if (isToday(serviceDate)) {
        msg = `${technician} will visit your location today`;
      }

      setMessage(msg);
    }
  }, [serviceOrder]);

  return (
    <Card
      onClick={onCardSelect}
      sx={{
        boxShadow: removeShadows ? 'none' : 'default',
        borderTopLeftRadius: removeTopLeftRadius ? 0 : 'default',
        borderTopRightRadius: removeTopRightRadius ? 0 : 'default',
        borderBottomRightRadius: removeBottomRightRadius ? 0 : 'default',
        borderBottomLeftRadius: removeBottomLeftRadius ? 0 : 'default',
        cursor: showPointer ? 'pointer' : 'default',
        background: selected ? theme.palette.secondary.outlinedHoverBg : null,
        border: selected ? `1px solid ${theme.palette.secondary.main}` : 'none',
        minHeight,
        ...containerStyles,
      }}>
      <CardHeader
        sx={{pb: '0.4em'}}
        action={
          headerActionIcon ? <IconButton>{headerActionIcon}</IconButton> : null
        }
        title={
          <HistoryCardHeader
            isDetailCard={isDetailCard}
            removeServiceOrderType={removeServiceOrderType}
            removeServiceOrderStatus={removeServiceOrderStatus}
            headerTitle={headerTitle}
            subtitle={subtitle}
            serviceOrderType={serviceOrder?.type}
            serviceOrderStatus={serviceOrder?.status}
          />
        }
      />
      <CardContent
        sx={{
          py: 0,
          mt: isDetailCard ? '2em' : 'default',
          ...bodyContainerStyle,
        }}>
        {noContent && !reportIsLoading ? (
          <HitoryCardEmptyState label={message} />
        ) : null}
        {reportIsLoading ? (
          <Typography>Loading</Typography>
        ) : (
          <>
            <Typography variant={isDetailCard ? 'body1' : 'caption'}>
              {description}
            </Typography>

            {showTimeCategory ? (
              <Box display="flex" mt="2.5em">
                <CardProps
                  label="Scheduled Time"
                  bodyTextVariant="subtitle1"
                  icon={<LockClockIcon color="info" />}
                  iconBackground={theme.palette.info.outlinedHoverBg}
                  bodyText={scheduledTime || ''}
                />
                <CardProps
                  label="Preferred Time"
                  bodyTextVariant="body1"
                  icon={<AccessTimeIcon color="warning" />}
                  iconBackground={theme.palette.warning.outlinedHoverBg}
                  bodyText="24 Sep 2021, 3PM"
                />
              </Box>
            ) : null}

            {showMoreReportDetails ? (
              <Box display="flex" mt="2.5em">
                <CardProps
                  label="Technician"
                  bodyTextVariant="body1"
                  icon={<PersonOutlineOutlinedIcon color="info" />}
                  iconBackground={theme.palette.info.outlinedHoverBg}
                  bodyText={`${serviceOrder?.schedules[0].technician.userAccount.firstName}
                 ${serviceOrder?.schedules[0].technician.userAccount.lastName}`}
                />
                <CardProps
                  label="Cost"
                  bodyTextVariant="caption"
                  icon={<MonetizationOnOutlinedIcon color="success" />}
                  iconBackground={theme.palette.success.outlinedHoverBg}
                  bodyText={
                    serviceOrderReport?.fee.amount
                      ? `${serviceOrderReport?.fee.amount} EUR`
                      : '0 EUR'
                  }
                />

                <CardProps
                  label="Duration"
                  bodyTextVariant="body1"
                  icon={<TimerOutlinedIcon color="warning" />}
                  iconBackground={theme.palette.warning.outlinedHoverBg}
                  bodyText={`${+duration[0]}hrs ${
                    Number(duration[1]) > 0 ? `${+duration[1]}mins` : ''
                  }`}
                />
              </Box>
            ) : null}
            {showAlert &&
            serviceOrder?.status === ServiceOrderStatus.SCHEDULED ? (
              <CardAlert message={message} />
            ) : null}
          </>
        )}
      </CardContent>
      {!noContent && showActionSection ? (
        <>
          <CardActions
            disableSpacing
            sx={{display: 'flex', justifyContent: 'center', mt: '0.5em'}}>
            <ExpandMore expand={expanded} onClick={handleExpandClick}>
              <ExpandMoreIcon />
            </ExpandMore>
          </CardActions>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <CardContent>{collapsedChildren}</CardContent>
          </Collapse>
        </>
      ) : null}
    </Card>
  );
};
