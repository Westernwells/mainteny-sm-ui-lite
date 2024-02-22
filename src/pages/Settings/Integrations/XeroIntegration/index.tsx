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
  const serviceCompanyId = user!.userAccount.serviceCompany.id;
  const {enqueueSnackbar, showError} = useSnackbar();
  const redirectionUrl = `${window.location.origin}/settings?tab=2`;

  const {
    values: {code, error},
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

  // Send code to server to connect integration, after redirection from Xero login page
  useEffect(() => {
    if (code) {
      connectToXero(
        {code, redirectionUrl},
        {
          onSuccess: () => {
            enqueueSnackbar('New integration added!');
          },
          onError: (err: unknown) => {
            console.log(err);
            if (err instanceof Error) {
              showError(err.message);
            }
          },
        },
      );
    } else if (error) {
      showError('Connection failed');
    }
  }, [code, error]);

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
          // const URL = `https://login.xero.com/identity/connect/authorize?response_type=code&client_id=AB40A2886C4C44828C5173C5436A2629&redirect_uri=http://localhost:3000/settings?tab=2&scope=accounting.transactions+accounting.settings+accounting.contacts+offline_access&state=b7af889d-3a6a-4113-b6e1-b34acda8fcdb`;
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
        hasError={isErrorConnecting || Boolean(error)}
        integration={integration}
      />
      <IntegrationCard
        enabled={integration?.enabled || false}
        hasError={isErrorConnecting || Boolean(error)}
        onConnect={handleOpenDialog}
        onDisconnect={() => setOpenDeleteConfirm(true)}
        {...integrationInfo}
      />
      <Confirm
        disableActions={isDisconnecting}
        open={openDeleteConfirm}
        onConfirm={async () => {
          await disconnectFromXero();
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
