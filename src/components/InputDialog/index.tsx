import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import {IconButton, TextField} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import DialogActions from '@mui/material/DialogActions';
import {Button} from 'components/Button';
import useTheme from '@mui/material/styles/useTheme';

type Props = {
  open?: boolean;
  value: string;
  useInternalState?: boolean;
  title?: string;
  confirmBtnLabel?: string;
  closeBtnLabel?: string;
  disableActions?: boolean;
  maxWidth?: string | number;
  onConfirm: (value: string) => void;
  onClose: () => void;
  onChange?: (e: React.ChangeEvent) => void;
};

const InputDialog = ({
  open,
  value,
  useInternalState = true,
  title,
  closeBtnLabel = 'Cancel',
  confirmBtnLabel = 'Rename',
  disableActions = false,
  maxWidth,
  onConfirm,
  onClose,
  onChange,
}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();

  const [tempValue, setTempValue] = useState(value);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempValue(e.target.value);
  };

  const fieldValue = useInternalState ? tempValue : value;
  const handleFieldChange = useInternalState ? handleInputChange : onChange;

  const handleConfirm = () => {
    onConfirm(fieldValue);
  };

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
        <TextField
          value={fieldValue}
          onChange={handleFieldChange}
          size="small"
          fullWidth
          sx={{mt: 2, mb: 1, width: '380px'}}
        />
      </DialogContent>
      <DialogActions sx={{padding: '1em', gap: theme.spacing(2)}}>
        <Button
          disabled={disableActions}
          buttonProps={{
            onClick: onClose,
            size: 'medium',
          }}>
          <Typography variant="subtitle2" color="primary.dark">
            {t(closeBtnLabel)}
          </Typography>
        </Button>

        <Button
          disabled={disableActions}
          buttonProps={{
            onClick: handleConfirm,
            autoFocus: true,
            size: 'medium',
            variant: 'contained',
            sx: {
              py: '6px',
              px: '16px',
            },
          }}>
          <Typography data-test-id="remove" variant="subtitle2">
            {t(confirmBtnLabel)}
          </Typography>
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InputDialog;
