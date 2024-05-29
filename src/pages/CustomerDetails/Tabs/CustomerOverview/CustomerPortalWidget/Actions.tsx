import React, {useState} from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import DoDisturbAltOutlinedIcon from '@mui/icons-material/DoDisturbAltOutlined';
import {Box} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {ContactsView, PORTAL_PERSON_STATUS} from 'models/contacts';
import {UserAccountStatus} from 'models/user';

export interface IActions {
  onDelete: (id: string) => void;
  onSendInvite: (id: string) => void;
  onRevokeAccess: (id: string) => void;
}

interface Props {
  contact: ContactsView;
  customerPortalEnabled: boolean;
}

interface ActionButton {
  icon: JSX.Element;
  label: string;
  onClick: () => void;
}

const Actions = ({
  contact,
  onSendInvite,
  onRevokeAccess,
  onDelete,
  customerPortalEnabled,
}: Props & IActions) => {
  const {t} = useTranslation();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);
  const contactId = contact?.id;

  const handleClose = () => setAnchorEl(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleDeleteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onDelete(contactId);
  };

  const handleRevokeClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onRevokeAccess(contactId);
  };

  const handleSendInviteClick = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();
    onSendInvite(contactId);
  };

  const menuActionButtons: ActionButton[] = [
    {
      icon: <SendOutlinedIcon sx={{color: 'text.secondary'}} />,
      label: 'Resend invite',
      onClick: () => onSendInvite(contactId),
    },
    {
      icon: <DoDisturbAltOutlinedIcon sx={{color: 'text.secondary'}} />,
      label: 'Revoke access',
      onClick: () => onRevokeAccess(contactId),
    },
  ];

  return (
    <Box
      display="flex"
      alignItems="center"
      sx={{opacity: customerPortalEnabled ? 1 : 0.4}}>
      <IconButton
        disabled={!customerPortalEnabled}
        onClick={handleDeleteClick}
        size="small">
        <DeleteOutlinedIcon sx={{color: 'secondary.mainLight'}} />
      </IconButton>

      {contact.userAccount.status === UserAccountStatus.NORMAL && (
        <IconButton
          disabled={!customerPortalEnabled}
          onClick={handleRevokeClick}
          size="small">
          <DoDisturbAltOutlinedIcon sx={{color: 'secondary.mainLight'}} />
        </IconButton>
      )}

      {contact.userAccount.status === PORTAL_PERSON_STATUS.PENDING ? (
        <IconButton
          disabled={!customerPortalEnabled}
          size="small"
          onClick={handleMenuClick}
          sx={{ml: '.25em'}}>
          <MoreVertIcon
            sx={{color: open ? 'primary.main' : 'action.active'}}
            fontSize="small"
          />
        </IconButton>
      ) : (
        contact.userAccount.status !== PORTAL_PERSON_STATUS.ACTIVE && (
          <IconButton
            disabled={!customerPortalEnabled}
            onClick={handleSendInviteClick}
            size="small">
            <SendOutlinedIcon sx={{color: 'secondary.mainLight'}} />
          </IconButton>
        )
      )}

      <Menu
        id="actions-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        sx={{
          minWidth: '12.5em',
          '& ul[role="menu"]': {padding: 0},
          '& li': {padding: '0.6em 1em'},
          '& li:not(:last-of-type)': {borderBottom: '1px solid #e0e0e0'},
        }}
        MenuListProps={{'aria-labelledby': 'actions-button'}}
        anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
        transformOrigin={{vertical: 'top', horizontal: 'right'}}
        PaperProps={{style: {width: 180}}}>
        {menuActionButtons.map((action, index) => (
          <MenuItem
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
              action.onClick();
            }}>
            <Box sx={{display: 'flex', alignItems: 'center', gap: '0.5em'}}>
              {action.icon}
              <Typography variant="body2">{t(action.label)}</Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default React.memo(Actions);
