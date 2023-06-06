import useTheme from '@mui/material/styles/useTheme';
import PhonelinkSetup from '@mui/icons-material/PhonelinkSetup';
import SdCard from '@mui/icons-material/SdCard';
import SupportAgent from '@mui/icons-material/SupportAgent';
import NotListedLocation from '@mui/icons-material/NotListedLocation';
import HomeRepairService from '@mui/icons-material/HomeRepairService';
import Grid3x3 from '@mui/icons-material/Grid3x3';
import Phone from '@mui/icons-material/Phone';
import {ElevatorView} from 'models/elevator';
import {CardProps} from 'components/CardProps';
import Lock from '@mui/icons-material/Lock';

interface Props {
  label: string;
  elevator: ElevatorView;
}

export const EmergencyPhoneSchema = ({label, elevator}: Props) => {
  const theme = useTheme();
  const renderSection = () => {
    switch (label) {
      case 'manufacturer':
        return (
          <CardProps
            icon={<HomeRepairService sx={{color: theme.palette.info.dark}} />}
            label="MANUFACTURER"
            bodyText={elevator.additionalInfo?.manufacturer || '-'}
            iconBackground={theme.palette.info.outlinedHoverBg}
            containerStyles={{mt: '0.5em'}}
            iconMaxHeight="3em"
          />
        );
      case 'systemId':
        return (
          <CardProps
            icon={<Grid3x3 sx={{color: theme.palette.info.dark}} />}
            label="SYSTEM ID"
            bodyText={elevator.additionalInfo?.elevatorPhone?.systemId || '-'}
            iconBackground={theme.palette.info.outlinedHoverBg}
            containerStyles={{mt: '0.5em'}}
            iconMaxHeight="3em"
          />
        );
      case 'phoneConnection':
        return (
          <CardProps
            icon={<PhonelinkSetup sx={{color: theme.palette.info.dark}} />}
            label="PHONE CONNECTION"
            bodyText={
              elevator.additionalInfo?.elevatorPhone?.connectionType || '-'
            }
            iconBackground={theme.palette.info.outlinedHoverBg}
            containerStyles={{mt: '0.5em'}}
            iconMaxHeight="3em"
          />
        );
      case 'phoneNumber':
        return (
          <CardProps
            icon={<Phone sx={{color: theme.palette.info.dark}} />}
            label="PHONE NUMBER"
            bodyText={
              elevator.additionalInfo?.elevatorPhone?.phoneNumber || '-'
            }
            iconBackground={theme.palette.info.outlinedHoverBg}
            containerStyles={{mt: '0.5em'}}
            iconMaxHeight="3em"
          />
        );
      case 'simCardNumber':
        return (
          <CardProps
            icon={<SdCard sx={{color: theme.palette.info.dark}} />}
            label="SIM CARD NUMBER"
            bodyText={
              elevator.additionalInfo?.elevatorPhone?.simCardNumber || '-'
            }
            iconBackground={theme.palette.info.outlinedHoverBg}
            containerStyles={{mt: '0.5em'}}
            iconMaxHeight="3em"
          />
        );

      case 'simPin':
        return (
          <CardProps
            icon={<Lock sx={{color: theme.palette.info.dark}} />}
            label="SIM PIN"
            bodyText={elevator.additionalInfo?.elevatorPhone?.simPin || '-'}
            iconBackground={theme.palette.info.outlinedHoverBg}
            containerStyles={{mt: '0.5em'}}
            iconMaxHeight="3em"
          />
        );

      case 'callCenter':
        return (
          <CardProps
            icon={<SupportAgent sx={{color: theme.palette.info.dark}} />}
            label="CALL CENTER"
            bodyText={elevator.additionalInfo?.elevatorPhone?.callCenter || '-'}
            iconBackground={theme.palette.info.outlinedHoverBg}
            containerStyles={{mt: '0.5em'}}
            iconMaxHeight="3em"
          />
        );
      case 'placeOfInstallation':
        return (
          <CardProps
            icon={<NotListedLocation sx={{color: theme.palette.info.dark}} />}
            label="PLACE OF INSTALLATION"
            bodyText={elevator.additionalInfo?.elevatorPhone?.location || '-'}
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
