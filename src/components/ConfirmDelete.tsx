import Dialog from '@mui/material/Dialog';
import {useTranslation} from 'react-i18next';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import {Button} from 'components/Button';
import {Box, SxProps} from '@mui/system';
import {CircularProgress} from '@mui/material';

interface Props {
  open: boolean;
  onConfirm: () => void;
  onClose: () => void;
  dialogContent?: JSX.Element;
  confirmText?: string;
  disableSave?: boolean;
  buttonSx?: SxProps;
  title?: string;
  body?: string[];
  saveLoading?: boolean;
}

export const ConfirmDelete = ({
  open,
  onConfirm,
  onClose,
  dialogContent,
  buttonSx,
  title = 'Delete note',
  body = ['You are about to delete a note, are you sure about this?'],
  confirmText = 'Delete note',
  disableSave = false,
  saveLoading = false,
}: Props) => {
  const {t} = useTranslation();
  return (
    <Dialog
      open={open || false}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      PaperProps={{
        sx: {
          padding: '1.5rem',
          maxWidth: '25rem',
        },
      }}>
      <DialogTitle id="alert-dialog-title" sx={{padding: 0}}>
        {t(title)}
      </DialogTitle>
      <DialogContent sx={{p: 0, px: 0, pb: '1.5rem'}}>
        <Box sx={{pt: '0.5rem'}}>
          {body.map((text, index) => (
            <DialogContentText
              key={index}
              id="alert-dialog-description"
              sx={{color: 'text.primary'}}>
              {t(text)}
            </DialogContentText>
          ))}
        </Box>

        {dialogContent}
      </DialogContent>
      <DialogActions sx={{padding: 0}}>
        <Button
          buttonProps={{
            onClick: onClose,
          }}>
          <Typography variant="subtitle2">{t('Cancel')}</Typography>
        </Button>

        <Button
          disabled={disableSave}
          buttonProps={{
            size: 'medium',
            onClick: onConfirm,

            autoFocus: true,
            variant: 'contained',
            sx: buttonSx,
            startIcon: saveLoading && <CircularProgress size={15} />,
          }}>
          <Typography variant="subtitle2">{t(confirmText)}</Typography>
        </Button>
      </DialogActions>
    </Dialog>
  );
};
