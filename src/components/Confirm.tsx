import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import {CustomButtonUnstyled} from './CustomButtonUnstyled';

interface Props {
  open?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  title?: string;
  content?: string;
}

export const Confirm = ({open, onConfirm, onClose, title, content}: Props) => (
  <Dialog
    open={open || false}
    onClose={onClose}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description">
    <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
    <DialogContent>
      <DialogContentText id="alert-dialog-description">
        {content}
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <CustomButtonUnstyled
        label="Create Service Order"
        buttonProps={{
          onClick: onClose,
        }}>
        <Typography variant="subtitle2" color="text.secondary">
          No
        </Typography>
      </CustomButtonUnstyled>

      <CustomButtonUnstyled
        label="Create Service Order"
        buttonProps={{
          onClick: onConfirm,
          autoFocus: true,
        }}>
        <Typography variant="subtitle2">Yes</Typography>
      </CustomButtonUnstyled>
    </DialogActions>
  </Dialog>
);
