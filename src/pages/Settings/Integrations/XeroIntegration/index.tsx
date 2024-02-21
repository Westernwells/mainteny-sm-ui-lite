import {FC, useState} from 'react';
import {ReactComponent as XeroIcon} from 'assets/icons/Xero.svg';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {
  useDeleteServiceCompanyXeroSettings,
  useServiceCompanyXeroSettings,
  useUpdateServiceCompanyXeroSettings,
} from 'hooks/reactQuery/useXero';
import {XeroIntegrationRecord} from 'models/integrations';
import {useSnackbar} from 'hooks/useSnackbar';
import {Progress} from 'components/Progress';
import {Confirm} from 'components/Confirm';
import IntegrationCard from '../IntegrationCard';
import {IIntegrationInfo} from '..';
import XeroDialog from './Dialog';

const integrationInfo: IIntegrationInfo = {
  title: 'Xero',
  description:
    'Xero online accounting software for your business connects you to your bank, accountant, bookkeeper, and other business apps.',
  icon: <XeroIcon style={{minWidth: '3rem', minHeight: '3rem'}} />,
};

// const successMsg = 'New integration added!';

const XeroIntegration: FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const {user} = useUserSession();
  const serviceCompanyId = user!.userAccount.serviceCompany.id;

  // const {enqueueSnackbar, showError} = useSnackbar();
  const {showError} = useSnackbar();

  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

  const {data: integration, isLoading} =
    useServiceCompanyXeroSettings(serviceCompanyId);
  const {
    mutate: updateXeroSettings,
    isLoading: isUpdating,
    isError: updateError,
  } = useUpdateServiceCompanyXeroSettings(serviceCompanyId);
  const {mutate: deleteXeroSettings, isLoading: isDeleting} =
    useDeleteServiceCompanyXeroSettings(serviceCompanyId);

  console.log('integration', integration);

  const handleCancel = () => {
    setIsDialogOpen(false);
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleSave = (formData: XeroIntegrationRecord) => {
    updateXeroSettings(
      {...formData, enabled: false},
      {
        onSuccess: (data) => {
          console.log('data', data);
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

  if (isLoading) {
    return <Progress />;
  }

  return (
    <>
      <XeroDialog
        open={isDialogOpen}
        onCancel={handleCancel}
        onSave={handleSave}
        isLoading={isUpdating}
        hasError={updateError}
        integration={integration}
      />
      <IntegrationCard
        enabled={integration?.enabled || false}
        hasError={updateError}
        onConnect={handleOpenDialog}
        onDisconnect={() => setOpenDeleteConfirm(true)}
        {...integrationInfo}
      />
      <Confirm
        disableActions={isDeleting}
        open={openDeleteConfirm}
        onConfirm={async () => {
          await deleteXeroSettings();
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
