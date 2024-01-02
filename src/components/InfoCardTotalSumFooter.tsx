import useTheme from '@mui/material/styles/useTheme';
import {Box, Typography} from '@mui/material';
import {formatCurrency} from 'utils/currency';

export interface Props {
  amount: number;
  label: string;
}

export const InfoCardTotalSumFooter = ({amount, label}: Props) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        width: '100%',
        background: theme.palette.inputBackground.main,
        padding: '0.8em',
        alignItems: 'center',
        borderTop: '1px solid #0F4C6414',
        borderBottom: '1px solid #0F4C6414',
      }}>
      <Typography
        color={theme.palette.text.secondary}
        variant="subtitle2"
        sx={{paddingRight: '2em'}}>
        {label}
      </Typography>
      <Typography
        color={theme.palette.text.primary}
        variant="subtitle1"
        fontWeight="600"
        sx={{marginRight: '14%'}}>
        {!!amount && formatCurrency(amount)}
      </Typography>
    </Box>
  );
};
