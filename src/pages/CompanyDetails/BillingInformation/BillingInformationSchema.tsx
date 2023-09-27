import {CardProps} from 'components/CardProps';
import useTheme from '@mui/material/styles/useTheme';
import {ServiceCompanyItem} from 'models/service-company';
import {PointOfSale, Receipt} from '@mui/icons-material';

interface Props {
  label: string;
  company: ServiceCompanyItem;
}

export const BillingInformationSchema = ({label, company}: Props) => {
  const theme = useTheme();

  const renderSection = () => {
    switch (label) {
      case 'vatId':
        return (
          <CardProps
            icon={<Receipt sx={{color: theme.palette.info.dark}} />}
            label="VAT ID"
            bodyText={company?.settings?.vatId || '-'}
            iconBackground={theme.palette.info.outlinedHoverBg}
            iconMaxHeight="3em"
            containerStyles={{mt: '0.5em'}}
          />
        );
      case 'percentageVat':
        return (
          <CardProps
            icon={<PointOfSale sx={{color: theme.palette.info.dark}} />}
            label="% VAT"
            bodyText={company?.settings?.percentageVat || '-'}
            iconBackground={theme.palette.info.outlinedHoverBg}
            iconMaxHeight="3em"
            containerStyles={{mt: '0.5em'}}
          />
        );
      case 'taxNumber':
        return (
          <CardProps
            icon={<Receipt sx={{color: theme.palette.info.dark}} />}
            label="Tax Number"
            bodyText={company?.settings?.taxNumber || '-'}
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
