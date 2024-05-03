import Dialog from '@mui/material/Dialog';
import {useTranslation} from 'react-i18next';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import {Button} from './Button';

interface Props {
  title: string;
  description: string;
  open?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmPrint = ({
  title,
  description,
  open,
  onConfirm,
  onClose,
}: Props) => {
  const {t} = useTranslation();
  return (
    <Dialog
      open={open || false}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: '100%',
          maxWidth: '27rem',
        },
      }}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description">
      <DialogTitle id="alert-dialog-title">{t(title)}</DialogTitle>
      <DialogContent color="text.primary" sx={{px: 3, py: 2}}>
        <Typography variant="body1">
          {t(description)}
          <br />
          <br />
          {t('Do you want to proceed?')}
        </Typography>
      </DialogContent>
      <DialogActions sx={{p: 3, pt: 0}}>
        <Button
          buttonProps={{
            size: 'medium',
            onClick: onClose,
          }}>
          <Typography variant="subtitle2" color="text.secondary">
            {t('Cancel')}
          </Typography>
        </Button>

        <Button
          buttonProps={{
            size: 'medium',
            variant: 'contained',
            onClick: onConfirm,
          }}>
          <Typography variant="subtitle2">{t('Print')}</Typography>
        </Button>
      </DialogActions>
    </Dialog>
  );
};
