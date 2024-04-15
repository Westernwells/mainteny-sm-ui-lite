import {CardProps} from 'components/CardProps';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import ApartmentIcon from '@mui/icons-material/Apartment';
import SocialDistanceIcon from '@mui/icons-material/SocialDistance';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TagIcon from '@mui/icons-material/Tag';
import useTheme from '@mui/material/styles/useTheme';
import {ElevatorView} from 'models/elevator';
import {useTranslation} from 'react-i18next';
import Typography from '@mui/material/Typography';
import {useNavigate} from 'react-router';
import {
  centsToMoney,
  getCurrencySymbol,
  useCurrentCurrency,
} from 'utils/currency';

interface Props {
  label: string;
  elevator: ElevatorView;
}

export const LocationSchema = ({label, elevator}: Props) => {
  const theme = useTheme();
  const {t} = useTranslation();
  const currentCurrency = useCurrentCurrency();

  const customer =
    elevator.propertyOwner.meta?.state === 'ACTIVE'
      ? elevator.propertyOwner
      : null;

  const renderSection = () => {
    const navigate = useNavigate();
    switch (label) {
      case 'customer':
        return (
          <CardProps
            icon={
              <BusinessCenterIcon sx={{color: theme.palette.primary.light}} />
            }
            label="Customer"
            bodyText={
              <Typography
                variant="subtitle1"
                onClick={() => {
                  if (customer) {
                    navigate(`/customers/details/${customer.id}?tab=0`);
                  }
                }}
                sx={{
                  color: customer ? 'primary.light' : '',
                  cursor: customer ? 'pointer' : '',
                  whiteSpace: 'wrap',
                  wordBreak: 'break-word',
                }}>
                {customer ? customer.name : '-'}
              </Typography>
            }
            containerStyles={{alignItems: 'center'}}
            iconMaxHeight="3em"
          />
        );
      case 'customerNumber':
        return (
          <CardProps
            icon={<TagIcon sx={{color: theme.palette.primary.light}} />}
            label="Customer number"
            bodyText={elevator.propertyOwner.externalId || '-'}
            containerStyles={{alignItems: 'center'}}
            iconMaxHeight="3em"
          />
        );
      case 'address':
        return (
          <CardProps
            icon={<LocationOnIcon sx={{color: theme.palette.primary.light}} />}
            label="Address"
            bodyText={elevator.address.fullName || '-'}
            containerStyles={{alignItems: 'center'}}
            iconMaxHeight="3em"
          />
        );
      case 'building':
        return (
          <CardProps
            icon={<BusinessIcon sx={{color: theme.palette.primary.light}} />}
            label="Building"
            bodyText={elevator.additionalInfo.buildingLocation || '-'}
            containerStyles={{alignItems: 'center'}}
            iconMaxHeight="3em"
          />
        );
      case 'propertySegment':
        return (
          <CardProps
            icon={<ApartmentIcon sx={{color: theme.palette.primary.light}} />}
            label="Property segment"
            bodyText={elevator.additionalInfo.propertySegment || '-'}
            containerStyles={{alignItems: 'center'}}
            iconMaxHeight="3em"
          />
        );
      case 'keyLocation':
        return (
          <CardProps
            icon={<VpnKeyIcon sx={{color: theme.palette.primary.light}} />}
            label="Key location"
            bodyText={elevator.additionalInfo.keyLocation || '-'}
            containerStyles={{alignItems: 'center'}}
            iconMaxHeight="3em"
          />
        );
      case 'parking':
        return (
          <CardProps
            icon={
              <LocalParkingIcon sx={{color: theme.palette.primary.light}} />
            }
            label="Parking"
            bodyText={elevator.additionalInfo.parking || '-'}
            containerStyles={{alignItems: 'center'}}
            iconMaxHeight="3em"
          />
        );
      case 'distance':
        return (
          <CardProps
            icon={
              <SocialDistanceIcon sx={{color: theme.palette.primary.light}} />
            }
            label="Distance"
            unitText={t('km')}
            bodyText={elevator.additionalInfo.distance || '-'}
            containerStyles={{alignItems: 'center'}}
            iconMaxHeight="3em"
          />
        );
      case 'travelTime':
        return (
          <CardProps
            icon={
              <TimerOutlinedIcon sx={{color: theme.palette.primary.light}} />
            }
            label="Travel time"
            unitText={t('min')}
            bodyText={elevator.additionalInfo.travelTime || '-'}
            containerStyles={{alignItems: 'center'}}
            iconMaxHeight="3em"
          />
        );
      case 'travelFee':
        return (
          <CardProps
            icon={<AttachMoneyIcon sx={{color: theme.palette.primary.light}} />}
            label="Travel fee"
            unitText={getCurrencySymbol[currentCurrency.code]}
            bodyText={
              centsToMoney(
                currentCurrency.code,
                elevator.additionalInfo.travelFee,
              ) || '-'
            }
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
