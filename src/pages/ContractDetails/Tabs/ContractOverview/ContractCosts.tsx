import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useTheme from '@mui/material/styles/useTheme';

interface Props {
  price?: number;
  currency?: string;
}

export const ContractCosts = ({price, currency}: Props) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        background: theme.palette.secondary.outlinedHoverBg,
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        alignItems: 'center',
        borderRadius: '20px',
      }}>
      <Typography variant="h4" color="primary">
        {price?.toLocaleString('en-US', {
          style: 'currency',
          currency,
        })}
      </Typography>
      <Typography variant="body1" sx={{color: theme.palette.text.secondary}}>
        Cost per year
      </Typography>
    </Box>
  );
};
