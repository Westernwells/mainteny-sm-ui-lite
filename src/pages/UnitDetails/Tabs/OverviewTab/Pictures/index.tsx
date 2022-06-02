import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {PageCard} from 'components/PageCard';
import useTheme from '@mui/material/styles/useTheme';

export const Pictures = () => {
  const theme = useTheme();
  console.log();
  return (
    <PageCard
      headerContainerOverrideStyles={{
        py: '0.2em',
        background: theme.palette.inputBackground.main,
      }}
      customHeader={
        <Typography component="div" variant="subtitle1">
          Pictures
        </Typography>
      }
      headerActionIcon={<Typography color="info.main">+Add</Typography>}>
      <Box>kdk</Box>
    </PageCard>
  );
};
