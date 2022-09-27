import Dialog from '@mui/material/Dialog';
import {useTranslation} from 'react-i18next';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import {Button} from 'components/Button';

interface Props {
  open: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmDelete = ({open, onConfirm, onClose}: Props) => {
  const {t} = useTranslation();
  return (
    <Dialog
      open={open || false}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      PaperProps={{
        sx: {
          padding: '1.5rem',
          maxWidth: '25rem',
        },
      }}>
      <DialogTitle id="alert-dialog-title" sx={{padding: 0}}>
        {t('Delete note')}
      </DialogTitle>
      <DialogContent sx={{p: 0, px: 0, pb: '1.5rem'}}>
        <DialogContentText
          id="alert-dialog-description"
          sx={{color: 'text.primary', pt: '0.5rem'}}>
          {t('You are about to delete a note, are you sure about this?')}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{padding: 0}}>
        <Button
          buttonProps={{
            onClick: onClose,
          }}>
          <Typography variant="subtitle2">{t('Cancel')}</Typography>
        </Button>

        <Button
          buttonProps={{
            size: 'medium',
            onClick: onConfirm,
            autoFocus: true,
            variant: 'contained',
          }}>
          <Typography variant="subtitle2">{t('Delete note')}</Typography>
        </Button>
      </DialogActions>
    </Dialog>
  );
};
