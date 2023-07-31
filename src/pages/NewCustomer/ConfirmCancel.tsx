import Dialog from '@mui/material/Dialog';
import {useTranslation} from 'react-i18next';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import {Button} from 'components/Button';

interface Props {
  open: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmCancel = ({open, onConfirm, onClose}: Props) => {
  const {t} = useTranslation();
  return (
    <Dialog
      open={open || false}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      PaperProps={{
        sx: {
          p: '1.5rem',
          maxWidth: '30rem',
        },
      }}>
      <DialogTitle id="alert-dialog-title" sx={{p: 0}}>
        {t('Cancel your progress?')}
      </DialogTitle>
      <DialogContent sx={{p: 0, px: 0, my: '2rem'}}>
        <Alert severity="warning">
          {t(
            'Are you sure you want to cancel your progress in creating a new customer?',
          )}
        </Alert>
      </DialogContent>
      <DialogActions sx={{p: 0}}>
        <Button buttonProps={{onClick: onClose, sx: {color: 'text.secondary'}}}>
          <Typography variant="subtitle2">{t('Close')}</Typography>
        </Button>

        <Button
          buttonProps={{
            size: 'medium',
            onClick: onConfirm,
            variant: 'contained',
            sx: {
              backgroundColor: 'warning.main',
            },
          }}>
          <Typography variant="subtitle2">{t('Cancel creation')}</Typography>
        </Button>
      </DialogActions>
    </Dialog>
  );
};
