import {ReactNode} from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

interface Props {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  header?: string;
  isScrollable?: boolean;
}

export const SelectModal = ({
  children,
  isOpen,
  onClose,
  header,
  isScrollable,
}: Props) => (
  <Modal open={isOpen} onClose={onClose} disablePortal>
    <Fade in={isOpen}>
      <Box
        sx={{
          position: 'absolute',
          color: 'text.primary',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'inputBackground.main',
          borderRadius: '20px',
          width: 'min(1024px , 80%)',
          pb: '1em',
          ml: '1.7em',
          top: '50%',
          left: '50%',
          overflow: 'hidden',
          transform: 'translate(-50%, -50%)',
          '&:focus-visible': {
            outline: 'none',
          },
        }}>
        <Box
          pt="1.25em"
          pb=".75em"
          px="1em"
          bgcolor="white"
          display="flex"
          justifyContent="space-between"
          alignItems="center">
          <Typography variant="h5">{header}</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box
          px="1em"
          pt=".5em"
          display="flex"
          flexDirection="column"
          minHeight="max(50vh, 300px)"
          sx={{overflowY: isScrollable ? 'scroll' : 'hidden'}}
          flexGrow={1}>
          {children}
        </Box>
      </Box>
    </Fade>
  </Modal>
);
