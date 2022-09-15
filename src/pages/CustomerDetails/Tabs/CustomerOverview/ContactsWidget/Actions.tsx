import {useState} from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import {Delete, Edit, MoreHoriz} from '@mui/icons-material';
import {Box} from '@mui/material';

import {useInviteContact} from 'hooks/reactQuery/useContacts';
import {ContactsStatus} from 'models/contacts';
import {useTranslation} from 'react-i18next';

interface Props {
  onEdit: () => void;
  onDelete: () => void;
  contactId: string;
  status: string;
}

export const Actions = ({onEdit, onDelete, contactId, status}: Props) => {
  const {t} = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const {mutateAsync: inviteContact} = useInviteContact(
    'Contact invited successfully',
  );
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleInvite = async () => {
    await inviteContact({
      userName: contactId || '',
    });

    handleClose();
  };

  const getTypeInvite = () => {
    switch (status) {
      case ContactsStatus.ACTIVE:
        return {
          // TODO: add revoke Access action
          action: () => console.log('revoke access'),
          label: 'Revoke Access',
        };
      case ContactsStatus.PENDING:
        return {
          action: handleInvite,
          label: 'Resend Invite',
        };
      default:
        return {
          action: handleInvite,
          label: 'Invite',
        };
    }
  };

  return (
    <Box>
      <IconButton component="a" onClick={onEdit}>
        <Edit sx={{color: 'action.active'}} fontSize="small" />
      </IconButton>
      <IconButton component="a" onClick={onDelete}>
        <Delete sx={{color: 'action.active'}} fontSize="small" />
      </IconButton>
      <IconButton size="small" onClick={handleClick} sx={{ml: '.25em'}}>
        <MoreHoriz sx={{color: 'action.active'}} fontSize="small" />
      </IconButton>
      <Menu
        id="actions-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        sx={{minWidth: '12.5em'}}
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
        }}
        PaperProps={{
          style: {
            width: 200,
          },
        }}>
        <MenuItem
          onClick={() => {
            handleClose();
            getTypeInvite().action();
          }}>
          <ListItemText>
            <Typography variant="body2">{t(getTypeInvite().label)}</Typography>
          </ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};
