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
// import {MaintenanceBasicInfo} from './ServiceBasicInfo';
import {HistoryCardHeader} from './HistoryCardHeader';

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
  headerTitle?: string;
  subtitle?: string;
  showMoreReportDetails?: boolean;
  showAlert?: boolean;
  collapsedChildren?: JSX.Element | null;
  expanded?: boolean;
  handleExpandClick?: () => void;
  showMoreSection?: true;
}

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
  const {expand, ...other} = props;
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
  showMoreSection,
  collapsedChildren = null,
  expanded = false,
  handleExpandClick = () => {},
}: Props) => {
  const theme = useTheme();
  return (
    <Card
      sx={{
        border: 'none',
        boxShadow: removeShadows ? 'none' : 'default',
        borderTopLeftRadius: removeTopLeftRadius ? 0 : 'default',
        borderTopRightRadius: removeTopRightRadius ? 0 : 'default',
        borderBottomRightRadius: removeBottomRightRadius ? 0 : 'default',
        borderBottomLeftRadius: removeBottomLeftRadius ? 0 : 'default',
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
          />
        }
      />
      <CardContent
        sx={{
          py: 0,
          mt: isDetailCard ? '2em' : 'default',
          ...bodyContainerStyle,
        }}>
        <Typography variant={isDetailCard ? 'body1' : 'caption'}>
          Checked the inner shaft of the elevator engine door....
        </Typography>

        {showTimeCategory ? (
          <Box display="flex" mt="2.5em">
            <CardProps
              label="Scheduled Time"
              bodyTextVariant="subtitle1"
              icon={<LockClockIcon color="info" />}
              iconBackground={theme.palette.info.outlinedHoverBg}
              bodyText="24 Sep 2021, 5 PM - 7PM "
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
              bodyText="John Doe"
            />
            <CardProps
              label="Cost"
              bodyTextVariant="caption"
              icon={<MonetizationOnOutlinedIcon color="success" />}
              iconBackground={theme.palette.success.outlinedHoverBg}
              bodyText="9,700 EUR"
            />

            <CardProps
              label="Duration"
              bodyTextVariant="body1"
              icon={<TimerOutlinedIcon color="warning" />}
              iconBackground={theme.palette.warning.outlinedHoverBg}
              bodyText="45 mins"
            />
          </Box>
        ) : null}
        {showAlert ? (
          <CardAlert message="Chris Anderson will be visiting your location in the next 20 minutes" />
        ) : null}
      </CardContent>
      {showMoreSection ? (
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
