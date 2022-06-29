import Dialog from '@mui/material/Dialog';
import {useTranslation} from 'react-i18next';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import {Button} from './Button';

interface Props {
  open?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  title?: string;
  content?: string;
  helperText?: string;
}

export const Confirm = ({
  open,
  onConfirm,
  onClose,
  title,
  content,
  helperText,
}: Props) => {
  const {t} = useTranslation();
  return (
    <Dialog
      open={open || false}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description">
      <DialogTitle id="alert-dialog-title">
        {typeof title === 'string' ? t(title) : title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText
          id="alert-dialog-description"
          sx={{color: 'text.primary'}}>
          <Typography>
            {typeof content === 'string' ? t(content) : content}
          </Typography>
          {helperText && (
            <Typography variant="subtitle2">{t(helperText)}</Typography>
          )}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          label="Create Service Order"
          buttonProps={{
            onClick: onClose,
          }}>
          <Typography variant="subtitle2" color="text.secondary">
            {t('No')}
          </Typography>
        </Button>

        <Button
          label="Create Service Order"
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
