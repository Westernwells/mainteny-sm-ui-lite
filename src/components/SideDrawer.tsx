import React, {ReactNode} from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import {Close} from '@mui/icons-material';

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  body: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
}

export const SideDrawer = ({open, setOpen, body, header, footer}: Props) => (
  <Drawer
    anchor="right"
    open={open}
    onClose={() => setOpen(false)}
    hideBackdrop
    PaperProps={{
      sx: {
        width: '32em',
        pt: 12,
        px: 2,
        color: 'text.primary',
        background: 'white',
        maxHeight: '100vh',
      },
    }}>
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Typography variant="h5" textTransform="capitalize">
        {header}
      </Typography>
      <IconButton onClick={() => setOpen(false)}>
        <Close />
      </IconButton>
    </Box>

    <Box
      role="presentation"
      my="2em"
      sx={{overflowY: 'scroll', height: '80%', maxHeight: '80%', pr: 1}}>
      {body}
    </Box>

    <Box display="flex" justifyContent="flex-end" gap="1em">
      <Button onClick={() => setOpen(false)} sx={{color: 'text.secondary'}}>
        Cancel
      </Button>
      {footer}
    </Box>
  </Drawer>
);
