import {useTranslation} from 'react-i18next';
import {CardProps} from 'components/CardProps';
import TimelapseIcon from '@mui/icons-material/Timelapse';
import ReplayCircleFilledIcon from '@mui/icons-material/ReplayCircleFilled';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import FlagIcon from '@mui/icons-material/Flag';
import useTheme from '@mui/material/styles/useTheme';
import {ElevatorView} from 'models/elevator';
import {convertMinsToHM} from 'utils/datetime';
import {useFormatDate} from 'hooks/useFormatDate';

interface Props {
  label: string;
  elevator: ElevatorView;
  visitNumber?: number;
}

export const ServiceSchema = ({label, elevator, visitNumber}: Props) => {
  const formatDate = useFormatDate();
  const {t} = useTranslation();
  const theme = useTheme();
  const renderSection = () => {
    switch (label) {
      case 'lastVisit':
        return (
          <CardProps
            icon={
              <CalendarTodayIcon sx={{color: theme.palette.primary.light}} />
            }
            label="Last visit"
            bodyText={
              elevator.lastVisitDate
                ? formatDate(new Date(elevator.lastVisitDate))
                : '-'
            }
            containerStyles={{alignItems: 'center'}}
            iconMaxHeight="3em"
          />
        );
      case 'requiredTime':
        return (
          <CardProps
            icon={<TimelapseIcon sx={{color: theme.palette.primary.light}} />}
            label="Required time"
            bodyText={
              elevator.serviceTime > 60
                ? convertMinsToHM(elevator.serviceTime)
                : elevator.serviceTime > 0
                ? `${elevator.serviceTime}m`
                : '-'
            }
            containerStyles={{alignItems: 'center'}}
            iconMaxHeight="3em"
          />
        );
      case 'lastInspection':
        return (
          <CardProps
            icon={
              <CalendarTodayIcon sx={{color: theme.palette.primary.light}} />
            }
            label="Last inspection"
            bodyText={
              elevator.additionalInfo.lastInspectionDate
                ? formatDate(
                    new Date(elevator.additionalInfo.lastInspectionDate),
                  )
                : '-'
            }
            containerStyles={{alignItems: 'center'}}
            iconMaxHeight="3em"
          />
        );
      case 'numOfTechnicians':
        return (
          <CardProps
            icon={<PeopleIcon sx={{color: theme.palette.primary.light}} />}
            label="No. of technicians"
            bodyText={elevator.technicianNumber}
            containerStyles={{alignItems: 'center'}}
            iconMaxHeight="3em"
          />
        );
      case 'unitPriority':
        return (
          <CardProps
            icon={<FlagIcon sx={{color: theme.palette.primary.light}} />}
            label="Priority"
            bodyText={t(elevator.additionalInfo.priority)}
            containerStyles={{alignItems: 'center'}}
            iconMaxHeight="3em"
          />
        );
      case 'visitsPerYear':
        return (
          <CardProps
            icon={
              <ReplayCircleFilledIcon
                sx={{color: theme.palette.primary.light}}
              />
            }
            label="Inspection cycle"
            // TODO: Update after backend implementation
            bodyText={visitNumber || '-'}
            containerStyles={{alignItems: 'center'}}
            iconMaxHeight="3em"
          />
        );
      default:
        return null;
    }
  };
  return renderSection();
};
