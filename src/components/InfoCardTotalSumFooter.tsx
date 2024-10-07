import useTheme from '@mui/material/styles/useTheme';
import {Box, Typography} from '@mui/material';
import {formatCurrency} from 'utils/currency';

export interface Props {
  amount: number;
  label: string;
  currency?: string;
}

export const InfoCardTotalSumFooter = ({amount, label, currency}: Props) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        width: '100%',
        background: theme.palette.inputBackground.main,
        padding: '0.8em 0em',
        alignItems: 'center',
        borderTop: '1px solid #0F4C6414',
        borderBottom: '1px solid #0F4C6414',
      }}>
      <Typography
        color={theme.palette.text.secondary}
        variant="subtitle2"
        sx={{paddingRight: '9%'}}>
        {label}
      </Typography>
      <Typography
        color={theme.palette.text.primary}
        variant="subtitle1"
        fontWeight="600"
        sx={{marginRight: '5%'}}>
        {!!amount && formatCurrency(amount, {...(currency && {currency})})}
      </Typography>
    </Box>
  );
};
