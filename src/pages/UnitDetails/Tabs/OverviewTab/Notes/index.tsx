import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {InfoCard} from 'components/InfoCard';
import useTheme from '@mui/material/styles/useTheme';

export const Notes = () => {
  const theme = useTheme();
  return (
    <InfoCard
      containerStyles={{
        [theme.breakpoints.up('md')]: {
          height: '100%',
        },
      }}
      showHeaderBackground
      header={
        <Typography component="div" variant="subtitle1">
          Notes
        </Typography>
      }
      headerActionIcon={<Typography color="info.main">+Add</Typography>}>
      <Box>kdk</Box>
    </InfoCard>
  );
};
