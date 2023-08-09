import MuiDialog, {DialogProps} from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import {ReactNode} from 'react';
import {useTranslation} from 'react-i18next';
import {Button} from './Button';

interface Props {
  title: string | JSX.Element;
  children: ReactNode;
  onSave?: () => void;
  onCancel: () => void;
  disableSaveBtn?: boolean;
  dialogProps: DialogProps;
  isSaving?: boolean;
  saveBtnType?: 'button' | 'submit' | 'reset';
}

export const Dialog = ({
  title,
  children,
  onSave = () => {},
  onCancel = () => {},
  disableSaveBtn,
  dialogProps,
  saveBtnType,
  isSaving = false,
}: Props) => {
  const {t} = useTranslation();
  return (
    <MuiDialog
      fullWidth
      onClose={onCancel}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      {...dialogProps}>
      <DialogTitle id="alert-dialog-title">
        {typeof title === 'string' ? t(title) : title}
      </DialogTitle>

      <DialogContent>
        <DialogContentText
          id="alert-dialog-description"
          component="div"
          sx={{color: 'text.primary', pt: '0.5rem'}}>
          {children}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{mt: '1.5em', padding: '0px 24px 20px 0px'}}>
        <Button buttonProps={{onClick: onCancel, size: 'large'}}>
          <Typography variant="subtitle2">{t('Cancel')}</Typography>
        </Button>
        <Button
          buttonProps={{
            size: 'large',
            variant: 'contained',
            onClick: onSave,
            autoFocus: true,
            disabled: disableSaveBtn || isSaving,
            type: saveBtnType,
          }}>
          <Typography variant="subtitle2">
            {isSaving ? `${t('Saving')}...` : t('Save')}
          </Typography>
        </Button>
      </DialogActions>
    </MuiDialog>
  );
};
