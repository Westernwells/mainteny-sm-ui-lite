import {useState} from 'react';
import Divider from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';
import ReplyAllIcon from '@mui/icons-material/ReplyAll';
import EditIcon from '@mui/icons-material/Edit';
import MoreIcon from '@mui/icons-material/MoreVert';
import SendIcon from '@mui/icons-material/Send';
import CopyAllIcon from '@mui/icons-material/CopyAll';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

interface Props {
  status: string;
}

export const Actions = ({status}: Props) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <>
      {status === 'SENT' ? (
        <IconButton onClick={() => console.log('ACTION: RESEND')}>
          <ReplyAllIcon sx={{color: '#2196F3', transform: 'rotate(180deg)'}} />
        </IconButton>
      ) : (
        <IconButton onClick={() => console.log('ACTION: EDIT')}>
          <EditIcon sx={{color: '#2196F3'}} />
        </IconButton>
      )}
      <IconButton onClick={handleClick} sx={{ml: '.5em'}}>
        <MoreIcon sx={{color: '#2196F3'}} />
      </IconButton>
      <Menu
        id="actions-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'actions-button',
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}>
        {status !== 'SENT' && (
          <MenuItem onClick={handleClose}>
            <ListItemIcon>
              <SendIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>
              <Typography variant="body2">Send</Typography>
            </ListItemText>
          </MenuItem>
        )}
        {status !== 'SENT' && <Divider />}

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
    </>
  );
};
