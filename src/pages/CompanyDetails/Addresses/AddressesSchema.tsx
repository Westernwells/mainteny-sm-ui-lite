import {CardProps} from 'components/CardProps';
import useTheme from '@mui/material/styles/useTheme';
import {ServiceCompanyItem} from 'models/service-company';
import {Business, MapsHomeWork, MarkunreadMailbox} from '@mui/icons-material';

interface Props {
  label: string;
  company: ServiceCompanyItem;
}

export const AddressesSchema = ({label, company}: Props) => {
  const theme = useTheme();

  const renderSection = () => {
    switch (label) {
      case 'billing':
        return (
          <CardProps
            icon={<MapsHomeWork sx={{color: theme.palette.info.dark}} />}
            label="BILLING ADDRESS"
            bodyText={company?.billingAddress?.fullName || '-'}
            iconBackground={theme.palette.info.outlinedHoverBg}
            iconMaxHeight="3em"
            containerStyles={{mt: '0.5em'}}
          />
        );
      case 'business':
        return (
          <CardProps
            icon={<Business sx={{color: theme.palette.info.dark}} />}
            label="BUSINESS ADDRESS"
            bodyText={company?.businessAddress?.fullName || '-'}
            iconBackground={theme.palette.info.outlinedHoverBg}
            iconMaxHeight="3em"
            containerStyles={{mt: '0.5em'}}
          />
        );
      case 'postal':
        return (
          <CardProps
            icon={<MarkunreadMailbox sx={{color: theme.palette.info.dark}} />}
            label="POSTAL ADDRESS"
            bodyText={company?.postalAddress?.fullName || '-'}
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
