import MuiDialog, {DialogProps} from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import React, {ReactNode} from 'react';
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
  leftButton?: React.ReactNode;
  saveButtonText?: string;
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
  leftButton,
  saveButtonText = 'Save',
}: Props) => {
  const {t} = useTranslation();
  return (
    <MuiDialog
      fullWidth
      sx={{height: '74%', margin: 'auto 0'}}
      onClose={onCancel}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      {...dialogProps}>
      <DialogTitle
        id="alert-dialog-title"
        sx={{
          background: 'white',
          boxShadow: '0px 4px 15px 0px #90909033',
          padding: '1em 1.5em',
          mb: '0.5em',
        }}>
        {typeof title === 'string' ? t(title) : title}
      </DialogTitle>

      <DialogContent sx={{pt: '1em'}}>
        <DialogContentText
          id="alert-dialog-description"
          component="div"
          sx={{color: 'text.primary', pt: '0.5rem'}}>
          {children}
        </DialogContentText>
      </DialogContent>
      <DialogActions
        sx={{
          padding: '1.5em 24px 1.5em 0px',
          display: 'flex',
          justifyContent: 'space-between',
          background: 'white',
          boxShadow: '0px 4px 15px 0px #90909033',
        }}>
        {leftButton}
        <Box sx={{marginLeft: 'auto'}}>
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
              {isSaving ? `${t('Saving')}...` : t(saveButtonText)}
            </Typography>
          </Button>
        </Box>
      </DialogActions>
    </MuiDialog>
  );
};
