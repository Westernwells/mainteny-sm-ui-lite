import {CardProps} from 'components/CardProps';
import EscalatorIcon from '@mui/icons-material/Escalator';
import ElevatorIcon from '@mui/icons-material/Elevator';
import FeaturedPlayListIcon from '@mui/icons-material/FeaturedPlayList';
import SplitscreenIcon from '@mui/icons-material/Splitscreen';
import BedroomChildIcon from '@mui/icons-material/BedroomChild';
import CallIcon from '@mui/icons-material/Call';
import LabelIcon from '@mui/icons-material/Label';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import LibraryAddCheckIcon from '@mui/icons-material/LibraryAddCheck';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import useTheme from '@mui/material/styles/useTheme';
import {ElevatorView} from 'models/elevator';

interface Props {
  label: string;
  elevator: ElevatorView;
  spendingLimit?: number;
  currency?: string;
}

export const UnitDetailsSchema = ({
  label,
  elevator,
  spendingLimit,
  currency,
}: Props) => {
  const theme = useTheme();
  const renderSection = () => {
    switch (label) {
      case 'category':
        return (
          <CardProps
            icon={<EscalatorIcon sx={{color: theme.palette.info.dark}} />}
            label="UNIT CATEGORY"
            bodyText={elevator.category || '-'}
            iconBackground={theme.palette.info.outlinedHoverBg}
            iconMaxHeight="3em"
            containerStyles={{mt: '0.5em'}}
          />
        );
      case 'manufacturer':
        return (
          <CardProps
            icon={<ElevatorIcon sx={{color: theme.palette.info.dark}} />}
            label="MANUFACTURER"
            bodyText={elevator.additionalInfo.manufacturer || '-'}
            iconBackground={theme.palette.info.outlinedHoverBg}
            iconMaxHeight="3em"
            containerStyles={{mt: '0.5em'}}
          />
        );
      case 'unitId':
        return (
          <CardProps
            icon={
              <FeaturedPlayListIcon sx={{color: theme.palette.info.dark}} />
            }
            label="UNIT NUMBER"
            bodyText={elevator.number || '-'}
            iconBackground={theme.palette.info.outlinedHoverBg}
            iconMaxHeight="3em"
            containerStyles={{mt: '0.5em'}}
          />
        );
      case 'stops':
        return (
          <CardProps
            icon={<SplitscreenIcon sx={{color: theme.palette.info.dark}} />}
            label="NUMBER OF STOPS"
            bodyText={elevator.additionalInfo.numberOfStops || '-'}
            iconBackground={theme.palette.info.outlinedHoverBg}
            iconMaxHeight="3em"
            containerStyles={{mt: '0.5em'}}
          />
        );
      case 'cabinType':
        return (
          <CardProps
            icon={<BedroomChildIcon sx={{color: theme.palette.info.dark}} />}
            label="CABIN TYPE"
            bodyText={elevator.additionalInfo.cabinType || '-'}
            iconBackground={theme.palette.info.outlinedHoverBg}
            iconMaxHeight="3em"
            containerStyles={{mt: '0.5em'}}
          />
        );
      case 'phone':
        return (
          <CardProps
            icon={<CallIcon sx={{color: theme.palette.info.dark}} />}
            label="EMERGENCY PHONE PROVIDER"
            bodyText={elevator.additionalInfo.emergencyPhoneProvider || '-'}
            iconBackground={theme.palette.info.outlinedHoverBg}
            iconMaxHeight="3em"
            containerStyles={{mt: '0.5em'}}
          />
        );

      case 'unitType':
        return (
          <CardProps
            icon={<LabelIcon sx={{color: theme.palette.info.dark}} />}
            label="UNIT TYPE"
            bodyText={elevator.type}
            iconBackground={theme.palette.info.outlinedHoverBg}
            iconMaxHeight="3em"
            containerStyles={{mt: '0.5em'}}
          />
        );

      case 'model':
        return (
          <CardProps
            icon={<LocalMallIcon sx={{color: theme.palette.info.dark}} />}
            label="MODEL"
            bodyText={elevator.model}
            iconBackground={theme.palette.info.outlinedHoverBg}
            iconMaxHeight="3em"
            containerStyles={{mt: '0.5em'}}
          />
        );

      case 'serialNumber':
        return (
          <CardProps
            icon={<LibraryAddCheckIcon sx={{color: theme.palette.info.dark}} />}
            label="SERIAL NUMBER"
            bodyText={elevator.serialNumber || '-'}
            iconBackground={theme.palette.info.outlinedHoverBg}
            iconMaxHeight="3em"
            containerStyles={{mt: '0.5em'}}
          />
        );

      case 'unitCapacity':
        return (
          <CardProps
            icon={<PeopleAltIcon sx={{color: theme.palette.info.dark}} />}
            label="UNIT CAPACITY"
            bodyText={elevator.capacity ? `${elevator.capacity}kg` : '-'}
            iconBackground={theme.palette.info.outlinedHoverBg}
            iconMaxHeight="3em"
            containerStyles={{mt: '0.5em'}}
          />
        );

      case 'spendingLimit':
        return (
          <CardProps
            icon={<MonetizationOnIcon sx={{color: theme.palette.info.dark}} />}
            label="SPENDING LIMIT"
            bodyText={spendingLimit ? `${spendingLimit} ${currency}` : '-'}
            iconBackground={theme.palette.info.outlinedHoverBg}
            iconMaxHeight="3em"
            containerStyles={{mt: '0.5em'}}
          />
        );
      default:
        return null;
    }
  };
  return renderSection();
};
