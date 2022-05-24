/*eslint-disable */
import {SyntheticEvent, useCallback, useEffect, useState} from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import * as _ from 'lodash';
import {useQueryServiceCompanyTechnicians} from 'hooks/reactQuery/useTechnician';
import {createEmptyResource} from 'utils/paging-utils';
import {TechnicianView} from 'models/technician';
import Box from '@mui/material/Box';
import {TechnicianAutoComplete} from './TechnicianAutoComplete';

interface Props {
  open?: boolean;
  // showSwitch?: boolean;
  getDialogState?: (val: boolean) => void;
  getTechnician?: (val: TechnicianView | null) => void;
}

export const AddTechnicianDialog = ({
  open,
  getDialogState,
  getTechnician,
}: Props) => {
  const [query, setQuery] = useState<string>('');
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
              fieldStyles={{minWidth: 500}}
              getTechnician={(value) => setTechnician(value)}
              label="Assign To"
              getQuery={(val) => setQueryView(val)}
            />
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{mt: '1.5em'}}>
          <Button onClick={onCancel}>
            <Typography variant="subtitle2" color="text.secondary">
              Cancel
            </Typography>
          </Button>
          <Button onClick={onSave} autoFocus disabled={!queryView}>
            <Typography variant="subtitle2">Add</Typography>
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
