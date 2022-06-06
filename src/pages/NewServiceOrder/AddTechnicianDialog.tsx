import {useEffect, useState} from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import {TechnicianView} from 'models/technician';
import {Button} from 'components/Button';
import Box from '@mui/material/Box';
import {TechnicianAutoComplete} from '../../components/TechnicianAutoComplete';

interface Props {
  open?: boolean;
  getDialogState?: (val: boolean) => void;
  getTechnician?: (val: TechnicianView | null) => void;
}

export const AddTechnicianDialog = ({
  open,
  getDialogState,
  getTechnician,
}: Props) => {
  const [showModal, setShowModal] = useState(false);
  const [queryView, setQueryView] = useState('');
  const [technician, setTechnician] = useState<TechnicianView | null>(null);

  useEffect(() => {
    if (open) {
      setShowModal(open);
    }
  }, [open]);

  useEffect(() => {
    if (getDialogState) {
      getDialogState(showModal);
    }
  }, [showModal]);

  const onSave = () => {
    if (getTechnician) {
      getTechnician(technician);
      setShowModal(false);
    }
  };

  const onCancel = () => setShowModal(false);

  return (
    <Box>
      <Dialog
        open={open || false}
        onClose={onCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">Add Technician</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" component="div">
            <TechnicianAutoComplete
              getTechnician={(value) => setTechnician(value)}
              getQuery={(val) => setQueryView(val)}
              textFieldProps={{
                sx: {
                  minWidth: 500,
                  label: 'Assign To',
                },
              }}
            />
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{mt: '1.5em'}}>
          <Button
            buttonProps={{
              onClick: onCancel,
              autoFocus: true,
              disabled: !queryView,
            }}>
            <Typography variant="subtitle2" color="text.secondary">
              Cancel
            </Typography>
          </Button>
          <Button
            buttonProps={{
              onClick: onSave,
            }}>
            <Typography variant="subtitle2">Add</Typography>
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
