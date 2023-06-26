import {useTranslation} from 'react-i18next';
import {CardProps} from 'components/CardProps';
import PermContactCalendarIcon from '@mui/icons-material/PermContactCalendar';
import CachedIcon from '@mui/icons-material/Cached';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
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
              <PermContactCalendarIcon sx={{color: theme.palette.info.dark}} />
            }
            label="LAST VISIT"
            bodyText={
              elevator.lastVisitDate
                ? formatDate(new Date(elevator.lastVisitDate))
                : '-'
            }
            iconBackground={theme.palette.info.outlinedHoverBg}
            containerStyles={{mt: '0.5em'}}
            iconMaxHeight="3em"
          />
        );
      case 'lastInspection':
        return (
          <CardProps
            icon={<CachedIcon sx={{color: theme.palette.info.dark}} />}
            label="LAST INSPECTION"
            bodyText={
              elevator.additionalInfo.lastInspectionDate
                ? formatDate(
                    new Date(elevator.additionalInfo.lastInspectionDate),
                  )
                : '-'
            }
            iconBackground={theme.palette.info.outlinedHoverBg}
            containerStyles={{mt: '0.5em'}}
            iconMaxHeight="3em"
          />
        );
      case 'visitsPerYear':
        return (
          <CardProps
            icon={<CalendarTodayIcon sx={{color: theme.palette.info.dark}} />}
            label="REQUIRED VISITS/YEAR"
            bodyText={visitNumber || ''}
            iconBackground={theme.palette.info.outlinedHoverBg}
            containerStyles={{mt: '0.5em'}}
            iconMaxHeight="3em"
          />
        );
      case 'requiredTime':
        return (
          <CardProps
            icon={
              <AccessTimeFilledIcon sx={{color: theme.palette.info.dark}} />
            }
            label="REQUIRED TIME"
            bodyText={
              elevator.serviceTime > 60
                ? convertMinsToHM(elevator.serviceTime)
                : elevator.serviceTime > 0
                ? `${elevator.serviceTime}m`
                : '-'
            }
            iconBackground={theme.palette.info.outlinedHoverBg}
            containerStyles={{mt: '0.5em'}}
            iconMaxHeight="3em"
          />
        );
      case 'numOfTechnicians':
        return (
          <CardProps
            icon={<PeopleIcon sx={{color: theme.palette.info.dark}} />}
            label="REQUIRED NO. OF TECHNICIANS"
            bodyText={elevator.technicianNumber}
            iconBackground={theme.palette.info.outlinedHoverBg}
            containerStyles={{mt: '0.5em'}}
            iconMaxHeight="3em"
          />
        );

      case 'unitPriority':
        return (
          <CardProps
            icon={<FlagIcon sx={{color: theme.palette.info.dark}} />}
            label="UNIT PRIORITY"
            bodyText={t(elevator.additionalInfo.priority)}
            iconBackground={theme.palette.info.outlinedHoverBg}
            containerStyles={{mt: '0.5em'}}
            iconMaxHeight="3em"
          />
        );
      default:
        return null;
    }
  };
  return renderSection();
};
