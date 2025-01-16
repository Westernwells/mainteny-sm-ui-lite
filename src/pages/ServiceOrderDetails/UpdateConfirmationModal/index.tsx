import {Dialog} from 'components/Dialog';
import {Typography} from '@mui/material';
import {Trans, useTranslation} from 'react-i18next';
import {ServiceOrderView} from 'models/service-order';
import {useState} from 'react';

type Props = {
  order: ServiceOrderView;
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const UpdateConfirmationModal = ({order, open, onConfirm, onCancel}: Props) => {
  const {t} = useTranslation();

  const [isLoading, setIsLoading] = useState(false);

  const handleSaveClick = () => {
    setIsLoading(true);
    onConfirm();
  };

  return (
    <Dialog
      dataTestId="job-update-confirmation-modal"
      title="Job update"
      onCancel={onCancel}
      onSave={handleSaveClick}
      dialogProps={{
        maxWidth: 'sm',
        open: open || false,
      }}
      saveButtonText="Save and Update"
      disableSaveBtn={isLoading}>
      <Typography>
        <Trans
          defaults="There are unsaved changes made to the job order <bold>{{invoiceId}}</bold> and these will be reflected on the invoice."
          values={{invoiceId: order.externalId}}
          components={{bold: <strong />}}
        />
      </Typography>
      <Typography>{t('Are you sure you want to continue?')}</Typography>
    </Dialog>
  );
};

export default UpdateConfirmationModal;
