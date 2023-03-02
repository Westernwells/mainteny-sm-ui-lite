import Dialog from '@mui/material/Dialog';
import {useTranslation} from 'react-i18next';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import {Button} from './Button';

interface Props {
  open?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmPrintInvoice = ({open, onConfirm, onClose}: Props) => {
  const {t} = useTranslation();
  return (
    <Dialog
      open={open || false}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: '100%',
          maxWidth: '23rem',
        },
      }}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description">
      <DialogTitle id="alert-dialog-title">{t('Print invoice')}</DialogTitle>
      <DialogContent color="text.primary">
        <Typography variant="body1">
          {t(
            'This action will set the status of the invoice to "Sent". The invoice can not be edited or deleted after.',
          )}
          <br />
          {t('Do you want to proceed?')}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          buttonProps={{
            onClick: onClose,
          }}>
          <Typography variant="subtitle2" color="text.secondary">
            {t('No')}
          </Typography>
        </Button>

        <Button
          buttonProps={{
            onClick: onConfirm,
            autoFocus: true,
          }}>
          <Typography variant="subtitle2">{t('Yes')}</Typography>
        </Button>
      </DialogActions>
    </Dialog>
  );
};
