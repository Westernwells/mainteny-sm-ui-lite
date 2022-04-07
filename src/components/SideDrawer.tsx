import React from 'react';
import {Button, Typography} from '@mui/material';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import {Close} from '@mui/icons-material';

// import Button from '@mui/material/Button';

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  body: JSX.Element;
  header?: string;
  footer?: JSX.Element;
}

export const SideDrawer = ({open, setOpen, body, header, footer}: Props) => {
  const showDrawer =
    (state: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
          (event as React.KeyboardEvent).key === 'Shift')
      ) {
        return;
      }

      setOpen(state);
    };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={showDrawer(false)}
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
          {header || ''}
        </Typography>
        <IconButton onClick={showDrawer(false)}>
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
        <Button onClick={showDrawer(false)} sx={{color: 'text.secondary'}}>
          Cancel
        </Button>
        {footer}
      </Box>
    </Drawer>
  );
};
