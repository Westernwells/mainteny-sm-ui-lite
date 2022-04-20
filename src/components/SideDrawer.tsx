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
  isScrollable?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
}

export const SideDrawer = ({
  open,
  setOpen,
  body,
  isScrollable,
  header,
  footer,
}: Props) => (
  <Drawer
    anchor="right"
    open={open}
    onClose={() => setOpen(false)}
    hideBackdrop
    PaperProps={{
      sx: {
        width: '32em',
        color: 'text.primary',
        background: 'white',
      },
    }}>
    <Box
      height="100vh"
      maxHeight="100vh"
      pt={12}
      pb={2}
      px={2}
      display="flex"
      flexDirection="column"
      justifyContent="space-between">
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
        flexGrow={1}
        sx={{
          overflowY: isScrollable ? 'scroll' : 'initial',
          pr: 1,
        }}>
        {body}
      </Box>

      {footer && (
        <Box display="flex" justifyContent="flex-end" gap="1em">
          <Button onClick={() => setOpen(false)} sx={{color: 'text.secondary'}}>
            Cancel
          </Button>
          {footer}
        </Box>
      )}
    </Box>
  </Drawer>
);
