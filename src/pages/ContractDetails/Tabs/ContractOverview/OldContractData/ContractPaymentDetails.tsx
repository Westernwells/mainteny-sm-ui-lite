import useTheme from '@mui/material/styles/useTheme';
import {CardProps} from 'components/CardProps';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import MoneyIcon from '@mui/icons-material/Money';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

interface Props {
  name?: string;
}

export const ContractPaymentDetails = ({name}: Props) => {
  const theme = useTheme();

  return (
    <>
      <CardProps
        label="Name"
        bodyTextVariant="subtitle1"
        icon={<PersonOutlineOutlinedIcon sx={{fontSize: '1.5rem'}} />}
        containerStyles={{mr: '0.5em'}}
        iconBackground={theme.palette.inputBackground.main}
        iconMaxHeight="3rem"
        bodyText={name || ''}
      />

      <CardProps
        label="IBAN"
        bodyTextVariant="subtitle1"
        icon={<MoneyIcon sx={{fontSize: '1.5rem'}} />}
        containerStyles={{mr: '0.5em', mt: '0.8em'}}
        iconBackground={theme.palette.inputBackground.main}
        iconMaxHeight="3rem"
        bodyText="SE87 3000 0000 0101 2345 67890" // TODO: No IBAN in API
      />

      <CardProps
        label="BIC"
        bodyTextVariant="subtitle1"
        icon={<AccountBalanceIcon sx={{fontSize: '1.5rem'}} />}
        containerStyles={{mr: '0.5em', mt: '0.8em'}}
        iconBackground={theme.palette.inputBackground.main}
        iconMaxHeight="3rem"
        bodyText="DEUTDEFF" // TODO: No BIC in API
      />
    </>
  );
};
