import Grid from '@mui/material/Grid';
import {FC} from 'react';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import useTheme from '@mui/system/useTheme';
import {Button} from 'components/Button';
import {IIntegrationInfo} from '..';

interface Props extends IIntegrationInfo {
  enabled: boolean;
  openDialog: () => void;
}

const IntegrationCard: FC<Props> = ({
  icon,
  title,
  description,
  enabled,
  openDialog,
}) => {
  const theme = useTheme();

  return (
    <>
      <Grid
        container
        alignItems="center"
        wrap="nowrap"
        justifyContent="space-between"
        gap={1}>
        <Grid container wrap="nowrap" alignItems="center" gap={2}>
          {icon}
          <Grid direction="column">
            <Typography variant="h6" noWrap>
              {title}
            </Typography>
            <Typography variant="body2">{description}</Typography>
          </Grid>
        </Grid>
        {!enabled ? (
          <Button
            label="Connect"
            buttonProps={{
              size: 'medium',
              variant: 'outlined',
              onClick: openDialog,
              sx: {
                bgcolor: theme.palette.primary.contrastText,
              },
            }}
          />
        ) : (
          <Button
            label="Connected"
            buttonProps={{
              size: 'medium',
              variant: 'contained',
              onClick: () => console.log('Disconnects'),
              sx: {
                bgcolor: theme.palette.primary.dark,
              },
            }}
          />
        )}
      </Grid>
      <Divider />
    </>
  );
};

export default IntegrationCard;
