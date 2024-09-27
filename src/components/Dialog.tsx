import MuiDialog, {DialogProps} from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import React, {ReactNode} from 'react';
import {useTranslation} from 'react-i18next';
import {ButtonProps, IconButton, SxProps, Theme} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {Button} from './Button';

interface Props {
  title: string | JSX.Element;
  children: ReactNode;
  onSave?: () => void;
  onCancel: (forceClose?: boolean) => void;
  showSaveButton?: boolean;
  showCancelButton?: boolean;
  disableSaveBtn?: boolean;
  dialogProps: DialogProps;
  isSaving?: boolean;
  saveBtnType?: 'button' | 'submit' | 'reset';
  leftButton?: React.ReactNode;
  saveButtonText?: string;
  cancelButtonText?: string;
  saveButtonVariant?: ButtonProps['variant'];
  saveButtonProps?: ButtonProps;
  saveButtonContainerProps?: ButtonProps;
  dialogContentStyles?: SxProps<Theme>;
  dialogTitleStyles?: SxProps<Theme>;
  sx?: SxProps<Theme>;
  dialogActionsStyles?: SxProps<Theme>;
  saveButtonContainerStyles?: SxProps<Theme>;
  dialogContentTextStyles?: SxProps<Theme>;
  dataTestId?: string;
  renderRightFooterButton?: () => JSX.Element;
}

export const Dialog = ({
  title,
  children,
  onSave = () => {},
  onCancel = () => {},
  showCancelButton = true,
  showSaveButton = true,
  disableSaveBtn = false, // Default value here
  dialogProps,
  saveBtnType,
  saveButtonContainerProps,
  isSaving = false,
  leftButton,
  renderRightFooterButton,
  saveButtonText = 'Save',
  cancelButtonText = 'Cancel',
  saveButtonVariant = 'contained',
  saveButtonProps,
  dialogContentStyles = {},
  dialogTitleStyles = {},
  dialogActionsStyles = {},
  saveButtonContainerStyles = {},
  dialogContentTextStyles = {},
  sx = {},
  dataTestId,
}: Props) => {
  const {t} = useTranslation();

  return (
    <MuiDialog
      fullWidth
      sx={{
        height: '74%',
        margin: 'auto 0',
        ...sx,
      }}
      onClose={() => onCancel(true)}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      {...dialogProps}
      data-testid={dataTestId}>
      <DialogTitle
        id="alert-dialog-title"
        sx={{
          background: 'white',
          padding: '1em 1em 1em 2.5em',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          ...dialogTitleStyles,
        }}>
        {typeof title === 'string' ? t(title) : title}
        <IconButton onClick={() => onCancel(true)}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{margin: '1em 0em 0em 1em', ...dialogContentStyles}}>
        <DialogContentText
          id="alert-dialog-description"
          component="div"
          sx={{
            color: 'text.primary',
            paddingTop: '0.3em',
            ...dialogContentTextStyles,
          }}>
          {children}
        </DialogContentText>
      </DialogContent>
      <DialogActions
        sx={{
          padding: '1.5em 24px 1.5em 1.5em',
          display: 'flex',
          justifyContent: 'space-between',
          background: 'white',
          marginLeft: '1em',
          ...dialogActionsStyles,
        }}>
        {leftButton}
        <Box
          sx={{
            marginLeft: 'auto',
            ...saveButtonContainerProps,
            ...saveButtonContainerStyles,
          }}>
          {showCancelButton && (
            <Button
              buttonProps={{
                size: 'large',
                onClick: () => onCancel(false),
              }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t(cancelButtonText)}
              </Typography>
            </Button>
          )}

          {renderRightFooterButton?.()}
          {!renderRightFooterButton && showSaveButton && (
            <Button
              testId="saveButton"
              buttonProps={{
                size: 'large',
                variant: saveButtonVariant,
                onClick: onSave,
                autoFocus: true,
                disabled: disableSaveBtn || isSaving,
                'aria-disabled': disableSaveBtn || isSaving,
                type: saveBtnType,
                ...saveButtonProps,
              }}>
              <Typography variant="subtitle2">
                {isSaving ? `${t('Saving')}...` : t(saveButtonText)}
              </Typography>
            </Button>
          )}
        </Box>
      </DialogActions>
    </MuiDialog>
  );
};
