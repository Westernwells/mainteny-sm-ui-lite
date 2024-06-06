import {ReactNode} from 'react';
import Dialog from '@mui/material/Dialog';
import {useTranslation} from 'react-i18next';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {IconButton} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import {Button} from './Button';

interface Props {
  open?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  title?: string;
  content?: string | ReactNode[] | ReactNode;
  secondContent?: string | ReactNode[];
  confirmBtnLabel?: string;
  closeBtnLabel?: string;
  helperText?: string;
  disableActions?: boolean;
  maxWidth?: string | number;
}

export const Confirm = ({
  open,
  onConfirm,
  onClose,
  title,
  content,
  secondContent,
  closeBtnLabel,
  confirmBtnLabel,
  helperText,
  disableActions = false,
  maxWidth,
}: Props) => {
  const {t} = useTranslation();
  return (
    <Dialog
      open={open || false}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      sx={{'& .MuiDialog-paper[role="dialog"]': {maxWidth}}}>
      <DialogTitle
        id="alert-dialog-title"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        {typeof title === 'string' ? t(title) : title}
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <DialogContentText
          id="alert-dialog-description"
          sx={{color: 'text.primary'}}>
          <Typography>
            {typeof content === 'string' ? t(content) : content}
          </Typography>
          <Typography>
            {typeof secondContent === 'string'
              ? t(secondContent)
              : secondContent}
          </Typography>
          {helperText && <Typography>{t(helperText)}</Typography>}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{padding: '1em'}}>
        <Button
          disabled={disableActions}
          label={t('Create Service Job')}
          buttonProps={{
            onClick: onClose,
          }}>
          <Typography variant="subtitle2" color="text.secondary">
            {closeBtnLabel ? t(closeBtnLabel) : t('No')}
          </Typography>
        </Button>

        <Button
          disabled={disableActions}
          label={t('Create Service Job')}
          buttonProps={{
            onClick: onConfirm,
            autoFocus: true,
            sx: {
              bgcolor: 'error.light',
              color: 'primary.contrastText',
              '&:hover': {
                bgcolor: 'error.light',
                color: 'primary.contrastText',
              },
            },
          }}>
          <Typography data-test-id="remove" variant="subtitle2">
            {confirmBtnLabel ? t(confirmBtnLabel) : t('Yes')}
          </Typography>
        </Button>
      </DialogActions>
    </Dialog>
  );
};
