import {FC, useState} from 'react';
import {ReactComponent as XeroIcon} from 'assets/icons/Xero.svg';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {
  useServiceCompanyXeroSettings,
  useUpdateServiceCompanyXeroSettings,
} from 'hooks/reactQuery/useXero';
import {XeroIntegrationRecord} from 'models/integrations';
import {useSnackbar} from 'hooks/useSnackbar';
import {useQueryClient} from 'react-query';
import {queryKeys} from 'reactQuery/constants';
import {Progress} from 'components/Progress';
import IntegrationCard from '../IntegrationCard';
import {IIntegrationInfo} from '..';
import XeroDialog from './Dialog';

const integrationInfo: IIntegrationInfo = {
  title: 'Xero',
  description:
    'Xero online accounting software for your business connects you to your bank, accountant, bookkeeper, and other business apps.',
  icon: <XeroIcon style={{minWidth: '3rem', minHeight: '3rem'}} />,
};

const successMsg = 'Xero integration settings updated successfully';

const XeroIntegration: FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const {user} = useUserSession();
  const serviceCompanyId = user!.userAccount.serviceCompany.id;

  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();

  const {mutate: updateXeroSettings, isLoading: isUpdating} =
    useUpdateServiceCompanyXeroSettings(serviceCompanyId);
  const {data: integration, isLoading} =
    useServiceCompanyXeroSettings(serviceCompanyId);

  const handleCancel = () => {
    setIsDialogOpen(false);
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleSave = (formData: Omit<XeroIntegrationRecord, 'enabled'>) => {
    updateXeroSettings(formData, {
      onSuccess: (data) => {
        console.log('data', data);
        // Invalidate and refetch
        // TODO: Redirect to
        queryClient.invalidateQueries([
          queryKeys.fetchXeroIntegration,
          serviceCompanyId,
        ]);
        enqueueSnackbar(successMsg, {
          variant: 'success',
        });
      },
      onError: (err: unknown) => {
        console.log(err);
        if (err instanceof Error) {
          showError(err.message);
        }
      },
    });
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
        integration={integration}
      />
      <IntegrationCard
        enabled={integration?.enabled || false}
        openDialog={handleOpenDialog}
        {...integrationInfo}
      />
    </>
  );
};

export default XeroIntegration;
