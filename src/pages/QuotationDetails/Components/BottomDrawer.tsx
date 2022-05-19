import {useState} from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import MoreIcon from '@mui/icons-material/MoreVert';
import PreviewIcon from '@mui/icons-material/Preview';
import CopyAllIcon from '@mui/icons-material/CopyAll';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DraftsIcon from '@mui/icons-material/Drafts';

interface Props {
  isOpen: boolean;
  isValid: boolean;
  onSubmit: () => void;
}

export const BottomDrawer = ({isOpen, isValid, onSubmit}: Props) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Drawer
      PaperProps={{
        sx: {
          background: 'white',
          color: 'primary.main',
          py: '1em',
          zIndex: 'mobileStepper',
        },
      }}
      variant="persistent"
      anchor="bottom"
      open={isOpen}>
      <Box
        display="flex"
        justifyContent="flex-end"
        gap={2}
        sx={{my: 'auto', px: '4em'}}>
        <Button
          variant="outlined"
          disabled={!isValid}
          startIcon={<PreviewIcon />}
          onClick={onSubmit}>
          preview
        </Button>
        <ButtonGroup
          variant="contained"
          aria-label="button group"
          disableElevation
          sx={{
            '& .Mui-disabled': {
              bgcolor: 'action.disabledBackground',
            },
          }}>
          <Button type="submit" disabled={!isValid} onClick={onSubmit}>
            Send to client
          </Button>
          <IconButton
            disabled={!isValid}
            onClick={handleClick}
            sx={{
              color: 'primary.contrastText',
              bgcolor: isValid ? 'primary.main' : 'green',
              borderRadius: '0 4px 4px 0',
              overflow: 'hidden',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            }}>
            <MoreIcon />
          </IconButton>
        </ButtonGroup>
      </Box>
      <Menu
        id="actions-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'actions-button',
        }}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}>
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <DraftsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body2">Save Draft</Typography>
          </ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <CopyAllIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body2">Duplicate</Typography>
          </ListItemText>
        </MenuItem>

        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <FileDownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body2">Download</Typography>
          </ListItemText>
        </MenuItem>
      </Menu>
    </Drawer>
  );
};
