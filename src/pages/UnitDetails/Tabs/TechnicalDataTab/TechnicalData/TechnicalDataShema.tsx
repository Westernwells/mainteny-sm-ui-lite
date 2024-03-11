import {CardProps} from 'components/CardProps';
import ElevatorIcon from '@mui/icons-material/Elevator';
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import SpeedIcon from '@mui/icons-material/Speed';
import SettingsRemoteIcon from '@mui/icons-material/SettingsRemote';
import DevicesIcon from '@mui/icons-material/Devices';
import DoorFrontIcon from '@mui/icons-material/DoorFront';
import MonitorWeightOutlinedIcon from '@mui/icons-material/MonitorWeightOutlined';
import HeightOutlinedIcon from '@mui/icons-material/HeightOutlined';
import useTheme from '@mui/material/styles/useTheme';
import {ElevatorView} from 'models/elevator';

interface Props {
  label: string;
  elevator: ElevatorView;
  spendingLimit?: number;
  currency?: string;
}

const TechnicalDataSchema = ({label, elevator}: Props) => {
  const theme = useTheme();

  const renderSection = () => {
    switch (label) {
      case 'stops':
        return (
          <CardProps
            icon={<ElevatorIcon sx={{color: theme.palette.primary.light}} />}
            label="# stops"
            bodyText={elevator.additionalInfo.numberOfStops || '-'}
            iconMaxHeight="3em"
            containerStyles={{alignItems: 'center'}}
          />
        );
      case 'drive':
        return (
          <CardProps
            icon={<SettingsIcon sx={{color: theme.palette.primary.light}} />}
            label="Drive"
            bodyText={elevator.additionalInfo.drive || '-'}
            iconMaxHeight="3em"
            containerStyles={{alignItems: 'center'}}
          />
        );
      case 'capacity':
        return (
          <CardProps
            icon={<PeopleIcon sx={{color: theme.palette.primary.light}} />}
            label="Capacity"
            bodyText={elevator.capacity || '-'}
            unitText="kg"
            iconMaxHeight="3em"
            containerStyles={{alignItems: 'center'}}
          />
        );
      case 'speed':
        return (
          <CardProps
            icon={<SpeedIcon sx={{color: theme.palette.primary.light}} />}
            label="Speed"
            bodyText={elevator.additionalInfo.speed || '-'}
            unitText="m/s"
            iconMaxHeight="3em"
            containerStyles={{alignItems: 'center'}}
          />
        );
      case 'controller':
        return (
          <CardProps
            icon={
              <SettingsRemoteIcon sx={{color: theme.palette.primary.light}} />
            }
            label="Controller"
            bodyText={elevator.additionalInfo.controller || '-'}
            iconMaxHeight="3em"
            containerStyles={{alignItems: 'center'}}
          />
        );
      case 'iotDevice':
        return (
          <CardProps
            icon={<DevicesIcon sx={{color: theme.palette.primary.light}} />}
            label="IoT Device"
            bodyText={elevator.additionalInfo.iotDevice || '-'}
            iconMaxHeight="3em"
            containerStyles={{alignItems: 'center'}}
          />
        );
      case 'cabinType':
        return (
          <CardProps
            icon={<DoorFrontIcon sx={{color: theme.palette.primary.light}} />}
            label="Cabin type"
            bodyText={elevator.additionalInfo.cabinType || '-'}
            iconMaxHeight="3em"
            containerStyles={{alignItems: 'center'}}
          />
        );
      case 'cageWeight':
        return (
          <CardProps
            icon={
              <MonitorWeightOutlinedIcon
                sx={{color: theme.palette.primary.light}}
              />
            }
            label="Cage weight"
            bodyText={elevator.additionalInfo.cageWeight || '-'}
            unitText="kg"
            iconMaxHeight="3em"
            containerStyles={{alignItems: 'center'}}
          />
        );
      case 'counterWeight':
        return (
          <CardProps
            icon={
              <MonitorWeightOutlinedIcon
                sx={{color: theme.palette.primary.light}}
              />
            }
            label="Counterweight"
            bodyText={elevator.additionalInfo.counterWeight || '-'}
            unitText="kg"
            iconMaxHeight="3em"
            containerStyles={{alignItems: 'center'}}
          />
        );
      case 'hoistingHeight':
        return (
          <CardProps
            icon={
              <HeightOutlinedIcon sx={{color: theme.palette.primary.light}} />
            }
            label="Hoisting height"
            bodyText={elevator.additionalInfo.hoistingHeight || '-'}
            unitText="m"
            iconMaxHeight="3em"
            containerStyles={{alignItems: 'center'}}
          />
        );
      case 'shaftHeight':
        return (
          <CardProps
            icon={
              <HeightOutlinedIcon sx={{color: theme.palette.primary.light}} />
            }
            label="Shaft height"
            bodyText={elevator.additionalInfo.shaftHeight || '-'}
            unitText="m"
            iconMaxHeight="3em"
            containerStyles={{alignItems: 'center'}}
          />
        );
      default:
        return null;
    }
  };
  return renderSection();
};

export default TechnicalDataSchema;
