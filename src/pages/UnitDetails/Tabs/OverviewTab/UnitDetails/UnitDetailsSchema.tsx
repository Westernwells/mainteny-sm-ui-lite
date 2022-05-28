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
import {Elevator} from 'models/elevator';

interface Props {
  label: string;
  elevator: Elevator;
}

export const UnitDetailsSchema = ({label, elevator}: Props) => {
  const theme = useTheme();
  const renderSection = () => {
    switch (label) {
      case 'category':
        return (
          <CardProps
            icon={<EscalatorIcon sx={{color: theme.palette.info.dark}} />}
            label="UNIT CATEGORY"
            bodyText={elevator.category}
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
            bodyText="KONE"
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
            bodyText={elevator.number}
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
            bodyText="6"
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
            bodyText="Single Door"
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
            bodyText="SafeLine"
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
            bodyText={elevator.capacity || '-'}
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
            bodyText="1,000€"
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
