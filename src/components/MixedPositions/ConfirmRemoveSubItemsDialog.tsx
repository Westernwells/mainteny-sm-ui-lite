import {Dialog} from 'components/Dialog';
import {Typography} from '@mui/material';
import {useTranslation} from 'react-i18next';

type Props = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmRemoveSubItemsDialog = ({open, onConfirm, onCancel}: Props) => {
  const {t} = useTranslation();

  return (
    <Dialog
      dataTestId="confirm-remove-subitems-dialog"
      title={t('Change Article Type')}
      onCancel={onCancel}
      onSave={onConfirm}
      dialogProps={{
        maxWidth: 'sm',
        open: open || false,
      }}
      saveButtonText={t('Yes, Change Type')}>
      <Typography>
        {t(
          'Are you sure you want to remove all sub-positions by changing the article type? This change cannot be undone.',
        )}
      </Typography>
    </Dialog>
  );
};

export default ConfirmRemoveSubItemsDialog;
