import {CardProps} from 'components/CardProps';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import ElevatorIcon from '@mui/icons-material/Elevator';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TagIcon from '@mui/icons-material/Tag';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import useTheme from '@mui/material/styles/useTheme';
import {ElevatorView} from 'models/elevator';
import {convertToText} from 'utils/utils';
import {useTranslation} from 'react-i18next';

interface Props {
  label: string;
  elevator: ElevatorView;
  currency: string;
}

export const GeneralSchema = ({label, elevator, currency}: Props) => {
  const theme = useTheme();
  const {t} = useTranslation();

  const renderSection = () => {
    switch (label) {
      case 'category':
        return (
          <CardProps
            icon={<ElevatorIcon sx={{color: theme.palette.primary.light}} />}
            label="Unit category"
            bodyText={t(convertToText(elevator.category) || '-')}
            iconMaxHeight="3em"
            containerStyles={{alignItems: 'center'}}
          />
        );
      case 'manufacturer':
        return (
          <CardProps
            icon={
              <BusinessCenterIcon sx={{color: theme.palette.primary.light}} />
            }
            label="Manufacturer"
            bodyText={elevator.additionalInfo.manufacturer || '-'}
            iconMaxHeight="3em"
            containerStyles={{alignItems: 'center'}}
          />
        );
      case 'model':
        return (
          <CardProps
            icon={<LocalMallIcon sx={{color: theme.palette.primary.light}} />}
            label="Model"
            bodyText={elevator.model || '-'}
            iconMaxHeight="3em"
            containerStyles={{alignItems: 'center'}}
          />
        );
      case 'serialNumber':
        return (
          <CardProps
            icon={<TagIcon sx={{color: theme.palette.primary.light}} />}
            label="Serial number"
            bodyText={elevator.serialNumber || '-'}
            iconMaxHeight="3em"
            containerStyles={{alignItems: 'center'}}
          />
        );
      case 'unitId':
        return (
          <CardProps
            icon={<TagIcon sx={{color: theme.palette.primary.light}} />}
            label="Unit number"
            bodyText={elevator.externalId || '-'}
            iconMaxHeight="3em"
            containerStyles={{alignItems: 'center'}}
          />
        );
      case 'spendingLimit':
        return (
          <CardProps
            testId="unit_spending_limit"
            icon={<AttachMoneyIcon sx={{color: theme.palette.primary.light}} />}
            label="Spending limit"
            unitText={currency}
            bodyText={elevator.additionalInfo.spendingLimit || '-'}
            iconMaxHeight="3em"
            containerStyles={{alignItems: 'center'}}
          />
        );
      case 'builtYear':
        return (
          <CardProps
            icon={
              <CalendarTodayIcon sx={{color: theme.palette.primary.light}} />
            }
            label="Year built"
            bodyText={elevator.additionalInfo.builtYear || '-'}
            iconMaxHeight="3em"
            containerStyles={{alignItems: 'center'}}
          />
        );
      case 'type':
        return (
          <CardProps
            icon={
              <MiscellaneousServicesIcon
                sx={{color: theme.palette.primary.light}}
              />
            }
            label="Unit Type"
            bodyText={t(elevator.type) || '-'}
            iconMaxHeight="3em"
            containerStyles={{alignItems: 'center'}}
          />
        );
      case 'numberOfStops':
        return (
          <CardProps
            icon={<TagIcon sx={{color: theme.palette.primary.light}} />}
            label="Number of Stops"
            bodyText={elevator.additionalInfo?.numberOfStops || '-'}
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
