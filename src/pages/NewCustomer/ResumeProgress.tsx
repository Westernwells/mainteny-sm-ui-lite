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

export const ResumeProgress = ({open, onConfirm, onClose}: Props) => {
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
        {t('Resume your progress?')}
      </DialogTitle>
      <DialogContent sx={{p: 0, px: 0, my: '2rem'}}>
        <Alert severity="info">
          {t(
            "We've saved your progress from the previous session. Would you like to continue where you left off or start from scratch?",
          )}
        </Alert>
      </DialogContent>
      <DialogActions sx={{p: 0}}>
        <Button buttonProps={{onClick: onClose, sx: {color: 'text.secondary'}}}>
          <Typography variant="subtitle2">{t('Start from scratch')}</Typography>
        </Button>

        <Button
          buttonProps={{
            size: 'medium',
            onClick: onConfirm,
            variant: 'contained',
          }}>
          <Typography variant="subtitle2">{t('Resume progress')}</Typography>
        </Button>
      </DialogActions>
    </Dialog>
  );
};
