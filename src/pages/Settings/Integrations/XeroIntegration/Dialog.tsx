import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import {FC, useEffect} from 'react';
import DialogActions from '@mui/material/DialogActions';
import {Button} from 'components/Button';
import Typography from '@mui/material/Typography';
import {useTranslation} from 'react-i18next';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import {ReactComponent as MaintenyLogo} from 'assets/icons/MaintenyLogo.svg';
import {ReactComponent as RightLeftArrowIcon} from 'assets/icons/RightLeftArrow.svg';
import {ReactComponent as XeroIcon} from 'assets/icons/Xero.svg';
import {useForm, SubmitHandler} from 'react-hook-form';
import {XeroIntegrationRecord, XeroIntegrationView} from 'models/integrations';
import {FormInput} from 'components/form/FormInput';
import PasswordInput from 'components/PasswordInput';
import {Button as LoadingButton} from 'components/LoadingButton';

interface Props {
  open: boolean;
  isLoading?: boolean;
  hasError?: boolean;
  integration?: XeroIntegrationView;
  onSave: (data: XeroIntegrationRecord) => void;
  onCancel: () => void;
}

const XeroDialog: FC<Props> = ({
  open,
  onCancel,
  onSave,
  isLoading,
  hasError,
  integration,
}) => {
  const {t} = useTranslation();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: {errors},
  } = useForm<XeroIntegrationRecord>({
    mode: 'all',
    defaultValues: {
      clientId: '',
      tenantId: '',
      secret: '',
    },
  });
  const watchAllFields = watch();

  useEffect(() => {
    reset({
      clientId: integration?.clientId,
      tenantId: integration?.tenantId,
      secret: '',
    });
  }, [reset, integration]);

  const onSubmit: SubmitHandler<XeroIntegrationRecord> = (data) => {
    onSave(data);
  };

  const renderAlert = () => {
    if (hasError) {
      return (
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
      );
    }
    return (
      <Alert severity="info">
        <Typography variant="subtitle2">{t('Xero integration')}</Typography>
        <Typography variant="body1">
          {t(
            'After you’ve entered the information bellow you will be redirected to Xero official page.',
          )}
        </Typography>
      </Alert>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      fullWidth
      maxWidth="sm">
      <DialogTitle id="alert-dialog-title">
        {t('Integration settings')}
      </DialogTitle>
      <DialogContent>
        <Grid container direction="column" gap={3}>
          <Grid
            container
            width="fit-content"
            height="80px"
            justifyContent="space-between"
            wrap="nowrap"
            alignSelf="center"
            gap={2}>
            <MaintenyLogo width="10rem" height="100%" />
            <RightLeftArrowIcon height="100%" width="1.5rem" />
            <XeroIcon height="100%" width="3rem" />
          </Grid>
          {renderAlert()}
          <form id="xeroIntegrationForm" onSubmit={handleSubmit(onSubmit)}>
            <Grid
              container
              display="grid"
              gridTemplateColumns="1fr 1fr"
              gap={3}>
              <FormInput
                props={{
                  label: 'Tenant ID',
                  type: 'text',
                  error: Boolean(errors.tenantId),
                  required: true,
                  helperText: errors.tenantId
                    ? 'Tenant ID is required'
                    : undefined,
                  ...register('tenantId', {
                    required: t('Tenant ID is required'),
                  }),
                }}
              />
              <FormInput
                props={{
                  label: 'Client ID',
                  type: 'text',
                  error: Boolean(errors.clientId),
                  required: true,
                  helperText: errors.tenantId
                    ? 'Client ID is required'
                    : undefined,
                  ...register('clientId', {
                    required: t('Client ID is required'),
                  }),
                }}
              />
              <PasswordInput
                containerStyles={{gridColumn: '1 / span 2'}}
                props={{
                  label: 'Client secret',
                  type: 'text',
                  error: Boolean(errors.secret),
                  required: true,
                  helperText: errors.secret
                    ? 'Client secret is required'
                    : undefined,
                  ...register('secret', {
                    required: t('Client secret is required'),
                  }),
                }}
              />
            </Grid>
          </form>
        </Grid>
      </DialogContent>
      <DialogActions sx={{mt: '1.5em'}}>
        <Button
          buttonProps={{
            onClick: onCancel,
          }}>
          <Typography variant="subtitle2" color="text.secondary">
            {t('Cancel')}
          </Typography>
        </Button>
        <LoadingButton
          buttonProps={{
            form: 'xeroIntegrationForm',
            type: 'submit',
            autoFocus: true,
            loading: isLoading,
            disabled:
              Object.keys(errors).length > 0 ||
              !watchAllFields.tenantId ||
              !watchAllFields.clientId ||
              !watchAllFields.secret,
          }}>
          <Typography variant="subtitle2">{t('Connect')}</Typography>
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default XeroDialog;
