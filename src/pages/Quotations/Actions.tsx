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
import {QuotationStatus} from 'models/quotation';

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
      {status === QuotationStatus.SENT_TO_CLIENT ? (
        <IconButton size="small" onClick={() => console.log('ACTION: RESEND')}>
          <ReplyAllIcon
            sx={{color: 'action.active', transform: 'rotate(180deg)'}}
          />
        </IconButton>
      ) : (
        <IconButton size="small" onClick={() => console.log('ACTION: EDIT')}>
          <EditIcon sx={{color: 'action.active'}} />
        </IconButton>
      )}
      <IconButton size="small" onClick={handleClick} sx={{ml: '.25em'}}>
        <MoreIcon sx={{color: 'action.active'}} />
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
        {status !== QuotationStatus.SENT_TO_CLIENT && (
          <>
            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <SendIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>
                <Typography variant="body2">Send</Typography>
              </ListItemText>
            </MenuItem>
            <Divider />
          </>
        )}

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
