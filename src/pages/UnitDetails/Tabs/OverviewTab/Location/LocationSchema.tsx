import {CardProps} from 'components/CardProps';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import MapsHomeWorkIcon from '@mui/icons-material/MapsHomeWork';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import HomeIcon from '@mui/icons-material/Home';
import useTheme from '@mui/material/styles/useTheme';
import {ElevatorView} from 'models/elevator';

interface Props {
  label: string;
  elevator: ElevatorView;
}

export const LocationSchema = ({label, elevator}: Props) => {
  const theme = useTheme();
  const renderSection = () => {
    switch (label) {
      case 'address':
        return (
          <CardProps
            icon={<HomeIcon sx={{color: theme.palette.info.dark}} />}
            label="ADDRESS"
            bodyText={elevator.address.fullName || '-'}
            iconBackground={theme.palette.info.outlinedHoverBg}
            containerStyles={{mt: '0.5em'}}
            iconMaxHeight="3em"
          />
        );
      case 'building':
        return (
          <CardProps
            icon={<LocationCityIcon sx={{color: theme.palette.info.dark}} />}
            label="BUILDING"
            bodyText={elevator.additionalInfo.buildingLocation || '-'}
            iconBackground={theme.palette.info.outlinedHoverBg}
            containerStyles={{mt: '0.5em'}}
            iconMaxHeight="3em"
          />
        );
      case 'propertySegment':
        return (
          <CardProps
            icon={<MapsHomeWorkIcon sx={{color: theme.palette.info.dark}} />}
            label="PROPERTY SEGMENT"
            bodyText={elevator.additionalInfo.propertySegment || '-'}
            iconBackground={theme.palette.info.outlinedHoverBg}
            containerStyles={{mt: '0.5em'}}
            iconMaxHeight="3em"
          />
        );
      case 'keyLocation':
        return (
          <CardProps
            icon={<LocationOnIcon sx={{color: theme.palette.info.dark}} />}
            label="KEY LOCATION"
            bodyText={elevator.additionalInfo.keyLocation || '-'}
            iconBackground={theme.palette.info.outlinedHoverBg}
            containerStyles={{mt: '0.5em'}}
            iconMaxHeight="3em"
          />
        );
      case 'parking':
        return (
          <CardProps
            icon={<LocalParkingIcon sx={{color: theme.palette.info.dark}} />}
            label="PARKING"
            bodyText={elevator.additionalInfo.parking || '-'}
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
