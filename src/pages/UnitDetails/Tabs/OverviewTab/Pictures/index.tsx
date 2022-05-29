import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {Button} from 'components/Button';
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
      headerActionIcon={
        <Button
          label="+Add"
          buttonProps={{
            sx: {
              color: 'info.main',
            },
          }}
        />
      }>
      <Box>kdk</Box>
    </PageCard>
  );
};
