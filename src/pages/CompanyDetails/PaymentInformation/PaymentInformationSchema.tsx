import {CardProps} from 'components/CardProps';
import useTheme from '@mui/material/styles/useTheme';
import {ServiceCompanyItem} from 'models/service-company';
import {AccountBalance, CreditCard, PriceChange} from '@mui/icons-material';

interface Props {
  label: string;
  company: ServiceCompanyItem;
}

export const PaymentInformationSchema = ({label, company}: Props) => {
  const theme = useTheme();

  const renderSection = () => {
    switch (label) {
      case 'iban':
        return (
          <CardProps
            icon={<PriceChange sx={{color: theme.palette.info.dark}} />}
            label="IBAN"
            bodyText={company?.settings?.paymentInfo?.iban || '-'}
            iconBackground={theme.palette.info.outlinedHoverBg}
            iconMaxHeight="3em"
            containerStyles={{mt: '0.5em'}}
          />
        );
      case 'bic':
        return (
          <CardProps
            icon={<AccountBalance sx={{color: theme.palette.info.dark}} />}
            label="BIC"
            bodyText={company?.settings?.paymentInfo?.bic || '-'}
            iconBackground={theme.palette.info.outlinedHoverBg}
            iconMaxHeight="3em"
            containerStyles={{mt: '0.5em'}}
          />
        );
      case 'accountNumber':
        return (
          <CardProps
            icon={<CreditCard sx={{color: theme.palette.info.dark}} />}
            label="ACCOUNT NUMBER"
            bodyText={company?.settings?.paymentInfo?.accountNumber || '-'}
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
