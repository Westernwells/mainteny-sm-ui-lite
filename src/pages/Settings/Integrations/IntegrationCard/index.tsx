import Grid from '@mui/material/Grid';
import {FC} from 'react';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import useTheme from '@mui/system/useTheme';
import {Button} from 'components/Button';
import Alert from '@mui/material/Alert';
import {useTranslation} from 'react-i18next';
import IconButton from '@mui/material/IconButton';
import {Edit} from '@mui/icons-material';
import {IIntegrationInfo} from '..';

interface Props extends IIntegrationInfo {
  enabled: boolean;
  hasError?: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

const IntegrationCard: FC<Props> = ({
  icon,
  title,
  description,
  enabled,
  hasError,
  onConnect,
  onDisconnect,
}) => {
  const theme = useTheme();
  const {t} = useTranslation();

  return (
    <>
      {hasError && (
        <Alert severity="error">
          <Typography variant="subtitle2">{t('Connection failed')}</Typography>
          <Typography variant="body1">
            {t(
              'This can happen due to third-party providers. Try changing your credentials and try again or contact the Mainteny team at ',
            )}
            <a style={{color: 'inherit'}} href="mailto:support@mainteny.com">
              support@mainteny.com
            </a>
            .
          </Typography>
        </Alert>
      )}
      <Grid
        container
        alignItems="center"
        wrap="nowrap"
        justifyContent="space-between"
        gap={1}>
        <Grid container wrap="nowrap" alignItems="center" gap={2}>
          {icon}
          <Grid container direction="column">
            <Typography variant="h6" noWrap>
              {t(title)}
            </Typography>
            <Typography variant="body2">{t(description)}</Typography>
          </Grid>
        </Grid>
        {!enabled ? (
          hasError ? (
            <>
              <Button
                label="Contact Support"
                buttonProps={{
                  size: 'medium',
                  variant: 'contained',
                  onClick: (event) => {
                    event.preventDefault();
                    window.location.href = 'mailto:support@mainteny.com';
                  },
                  sx: {
                    bgcolor: theme.palette.primary.dark,
                    whiteSpace: 'nowrap',
                  },
                }}
              />
              <IconButton
                onClick={onConnect}
                data-test-id="edit-contract"
                sx={{color: 'action.active'}}>
                <Edit fontSize="small" />
              </IconButton>
            </>
          ) : (
            <Button
              label="Connect"
              buttonProps={{
                size: 'medium',
                variant: 'outlined',
                onClick: onConnect,
                sx: {
                  bgcolor: theme.palette.primary.contrastText,
                },
              }}
            />
          )
        ) : (
          <Button
            label="Disconnect"
            buttonProps={{
              size: 'medium',
              variant: 'outlined',
              color: 'error',
              onClick: onDisconnect,
              sx: {
                bgcolor: theme.palette.primary.contrastText,
                borderColor: theme.palette.error.main,
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
