import {FC, useEffect, useState} from 'react';
import {ReactComponent as XeroIcon} from 'assets/icons/Xero.svg';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {
  useDeleteServiceCompanyXeroSettings,
  useServiceCompanySettingXeroConnect,
  useServiceCompanyXeroSettings,
  useUpdateServiceCompanyXeroSettings,
} from 'hooks/reactQuery/useXero';
import {XeroIntegrationRecord} from 'models/integrations';
import {useSnackbar} from 'hooks/useSnackbar';
import {Progress} from 'components/Progress';
import {Confirm} from 'components/Confirm';
import {useSearchValues} from 'hooks/useSearchValues';
import {useQueryClient} from 'react-query';
import {queryKeys} from 'reactQuery/constants';
import {useTranslation} from 'react-i18next';
import IntegrationCard from '../IntegrationCard';
import {IIntegrationInfo} from '..';
import XeroDialog from './Dialog';

const integrationInfo: IIntegrationInfo = {
  title: 'Xero',
  description:
    'Xero online accounting software for your business connects you to your bank, accountant, bookkeeper, and other business apps.',
  icon: <XeroIcon style={{minWidth: '3rem', minHeight: '3rem'}} />,
};

const XeroIntegration: FC = () => {
  const {user} = useUserSession();
  const {t} = useTranslation();
  const serviceCompanyId = user!.userAccount.serviceCompany.id;
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();
  const redirectionUrl = `${window.location.origin}/settings/integrations`;

  const {
    values: {code, error},
    clearValues,
  } = useSearchValues<{code: string; error: string}>();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

  const {data: integration, isLoading} =
    useServiceCompanyXeroSettings(serviceCompanyId);
  const {mutate: updateXeroSettings, isLoading: isUpdating} =
    useUpdateServiceCompanyXeroSettings(serviceCompanyId);
  const {mutate: disconnectFromXero, isLoading: isDisconnecting} =
    useDeleteServiceCompanyXeroSettings(serviceCompanyId);
  const {
    mutate: connectToXero,
    isLoading: isConnecting,
    isError: isErrorConnecting,
  } = useServiceCompanySettingXeroConnect(serviceCompanyId);

  const hasConnectionError =
    (isErrorConnecting || Boolean(error)) && !integration?.enabled;

  const handleSuccess = () => {
    enqueueSnackbar(t('New integration added!'), {variant: 'success'});
    queryClient.invalidateQueries(queryKeys.fetchXeroIntegration);
    clearValues();
  };

  const handleError = (err: unknown) => {
    console.error(err);
    if (err instanceof Error) {
      showError(err.message);
    } else {
      showError(t('An error occurred during connection.'));
    }
  };

  useEffect(() => {
    if (integration && !integration?.enabled) {
      if (code) {
        connectToXero(
          {code, redirectionUrl},
          {
            onSuccess: handleSuccess,
            onError: handleError,
          },
        );
      } else if (error) {
        showError(t('Connection failed'));
      }
    }
  }, [code, error, integration?.enabled]);

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleSave = (formData: XeroIntegrationRecord) => {
    updateXeroSettings(
      {...formData, enabled: false, redirectionUrl},
      {
        onSuccess: (data) => {
          // Redirect to XERO login page
          const URL = data?.xeroAuthUrl;
          if (URL) {
            window.location.href = URL;
          }
        },
        onError: (err: unknown) => {
          console.log(err);
          if (err instanceof Error) {
            showError(err.message);
          }
        },
      },
    );
  };

  if (isLoading || isConnecting || isDisconnecting) {
    return <Progress />;
  }

  return (
    <>
      <XeroDialog
        open={isDialogOpen}
        onCancel={handleCloseDialog}
        onSave={handleSave}
        isLoading={isUpdating}
        hasError={hasConnectionError}
        integration={integration}
      />
      <IntegrationCard
        enabled={integration?.enabled || false}
        hasError={hasConnectionError}
        onConnect={handleOpenDialog}
        onDisconnect={() => setOpenDeleteConfirm(true)}
        {...integrationInfo}
      />
      <Confirm
        disableActions={isDisconnecting}
        open={openDeleteConfirm}
        onConfirm={() => {
          disconnectFromXero((() => {})(), {
            onSuccess() {
              enqueueSnackbar(t('Successfully disconnected from Xero!'), {
                variant: 'success',
              });
              queryClient.invalidateQueries(queryKeys.fetchXeroIntegration);
            },
          });
          setOpenDeleteConfirm(false);
        }}
        onClose={() => setOpenDeleteConfirm(false)}
        title="Confirm"
        content="Do you want to disconnect Xero integration?"
      />
    </>
  );
};

export default XeroIntegration;
