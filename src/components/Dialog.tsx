import MuiDialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import React, {ReactNode} from 'react';
import {Button} from './Button';

interface Props {
  title: string | JSX.Element;
  children: ReactNode;
  open?: boolean;
  onSave: () => void;
  onCancel: () => void;
  disableSaveBtn?: boolean;
}

export const Dialog = ({
  title,
  children,
  open,
  onSave,
  onCancel,
  disableSaveBtn,
}: Props) => {
  console.log('');
  return (
    <MuiDialog
      open={open || false}
      onClose={onCancel}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description">
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description" component="div">
          {children}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{mt: '1.5em'}}>
        <Button
          buttonProps={{
            onClick: onCancel,
          }}>
          <Typography variant="subtitle2" color="text.secondary">
            Cancel
          </Typography>
        </Button>
        <Button
          buttonProps={{
            onClick: onSave,
            autoFocus: true,
            disabled: disableSaveBtn,
          }}>
          <Typography variant="subtitle2">Save</Typography>
        </Button>
      </DialogActions>
    </MuiDialog>
  );
};
