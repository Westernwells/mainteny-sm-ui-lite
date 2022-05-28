import {CardProps} from 'components/CardProps';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import MapsHomeWorkIcon from '@mui/icons-material/MapsHomeWork';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import HomeIcon from '@mui/icons-material/Home';
import useTheme from '@mui/material/styles/useTheme';
import {Elevator} from 'models/elevator';

interface Props {
  label: string;
  elevator: Elevator;
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
            bodyText={elevator.address.fullName}
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
            bodyText="Block 5"
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
            bodyText="Commercial"
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
            bodyText="At reception"
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
            bodyText="Basement, B14"
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
