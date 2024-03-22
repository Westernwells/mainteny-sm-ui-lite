import {CardProps} from 'components/CardProps';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import TagIcon from '@mui/icons-material/Tag';
import PhonelinkSetupIcon from '@mui/icons-material/PhonelinkSetup';
import PhoneIcon from '@mui/icons-material/Phone';
import SimCardIcon from '@mui/icons-material/SimCard';
import SimCardAlertIcon from '@mui/icons-material/SimCardAlert';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import PlaceIcon from '@mui/icons-material/Place';
import useTheme from '@mui/material/styles/useTheme';
import {ElevatorView} from 'models/elevator';

interface Props {
  label: string;
  elevator: ElevatorView;
  spendingLimit?: number;
  currency?: string;
}

// 'manufacturer',
// 'systemId',
// 'phoneConnection',
// 'phoneNumber',
// 'simCardNumber',
// 'simPin',
// 'callCenter',
// 'placeOfInstallation',

const AutoDialerSchema = ({label, elevator}: Props) => {
  const theme = useTheme();

  const renderSection = () => {
    switch (label) {
      case 'manufacturer':
        return (
          <CardProps
            icon={
              <BusinessCenterIcon sx={{color: theme.palette.primary.light}} />
            }
            label="Manufacturer"
            bodyText={elevator.additionalInfo?.emergencyPhoneProvider || '-'}
            iconMaxHeight="3em"
            containerStyles={{alignItems: 'center'}}
          />
        );
      case 'systemId':
        return (
          <CardProps
            icon={<TagIcon sx={{color: theme.palette.primary.light}} />}
            label="System ID"
            bodyText={elevator.additionalInfo?.elevatorPhone?.systemId || '-'}
            iconMaxHeight="3em"
            containerStyles={{alignItems: 'center'}}
          />
        );
      case 'phoneConnection':
        return (
          <CardProps
            icon={
              <PhonelinkSetupIcon sx={{color: theme.palette.primary.light}} />
            }
            label="Phone connection"
            bodyText={
              elevator.additionalInfo?.elevatorPhone?.connectionType || '-'
            }
            iconMaxHeight="3em"
            containerStyles={{alignItems: 'center'}}
          />
        );
      case 'phoneNumber':
        return (
          <CardProps
            icon={<PhoneIcon sx={{color: theme.palette.primary.light}} />}
            label="Phone number"
            bodyText={
              elevator.additionalInfo?.elevatorPhone?.phoneNumber || '-'
            }
            iconMaxHeight="3em"
            containerStyles={{alignItems: 'center'}}
          />
        );
      case 'simCardNumber':
        return (
          <CardProps
            icon={<SimCardIcon sx={{color: theme.palette.primary.light}} />}
            label="Sim card number"
            bodyText={
              elevator.additionalInfo?.elevatorPhone?.simCardNumber || '-'
            }
            iconMaxHeight="3em"
            containerStyles={{alignItems: 'center'}}
          />
        );
      case 'simPin':
        return (
          <CardProps
            icon={
              <SimCardAlertIcon sx={{color: theme.palette.primary.light}} />
            }
            label="Sim pin"
            bodyText={elevator.additionalInfo?.elevatorPhone?.simPin || '-'}
            iconMaxHeight="3em"
            containerStyles={{alignItems: 'center'}}
          />
        );
      case 'callCenter':
        return (
          <CardProps
            icon={
              <SupportAgentIcon sx={{color: theme.palette.primary.light}} />
            }
            label="Call center"
            bodyText={elevator.additionalInfo?.elevatorPhone?.callCenter || '-'}
            iconMaxHeight="3em"
            containerStyles={{alignItems: 'center'}}
          />
        );
      case 'placeOfInstallation':
        return (
          <CardProps
            icon={<PlaceIcon sx={{color: theme.palette.primary.light}} />}
            label="Place of installation"
            bodyText={elevator.additionalInfo?.elevatorPhone?.location || '-'}
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

export default AutoDialerSchema;
