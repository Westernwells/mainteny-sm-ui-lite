import React, {useState} from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import DoDisturbAltOutlinedIcon from '@mui/icons-material/DoDisturbAltOutlined';
import {useTranslation} from 'react-i18next';
import {ContactsView, PORTAL_PERSON_STATUS} from 'models/contacts';
import {UserAccountStatus} from 'models/user';
import TableActionButton from 'components/Table/TableActionButton';

export interface IActions {
  onDelete: (id: string) => void;
  onSendInvite: (id: string) => void;
  onRevokeAccess: (id: string) => void;
}

interface Props {
  contact: ContactsView;
  customerPortalEnabled: boolean;
}

const Actions = ({
  contact,
  onSendInvite,
  onRevokeAccess,
  onDelete,
  customerPortalEnabled,
}: Props & IActions) => {
  const {t} = useTranslation();
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLButtonElement | null>(
    null,
  );
  const open = Boolean(menuAnchorEl);
  const contactId = contact?.id;

  const handleMenuClose = () => setMenuAnchorEl(null);

  const menuActions = [
    {
      icon: <SendOutlinedIcon sx={{color: 'text.secondary'}} />,
      label: t('Resend invite'),
      onClick: () => {
        onSendInvite(contactId);
        handleMenuClose();
      },
      visible:
        contact.userAccount.status === PORTAL_PERSON_STATUS.PENDING ||
        contact.userAccount.status !== PORTAL_PERSON_STATUS.ACTIVE,
    },
    {
      icon: <DoDisturbAltOutlinedIcon sx={{color: 'text.secondary'}} />,
      label: t('Revoke access'),
      onClick: () => {
        onRevokeAccess(contactId);
        handleMenuClose();
      },
      visible: contact.userAccount.status === UserAccountStatus.NORMAL,
    },
    {
      icon: <DeleteOutlinedIcon sx={{color: 'secondary.mainLight'}} />,
      label: t('Delete contact'),
      onClick: () => {
        onDelete(contactId);
        handleMenuClose();
      },
      visible: true,
    },
  ];

  return (
    <Box display="flex" alignItems="center">
      <TableActionButton
        testId="actions-menu-button"
        removePadding
        disabled={!customerPortalEnabled}
        onClick={(event) => {
          event.stopPropagation();
          setMenuAnchorEl(event.currentTarget);
        }}
        buttonStyles={{opacity: !customerPortalEnabled ? 0.4 : 1}}
      />

      <Menu
        id="actions-menu"
        anchorEl={menuAnchorEl}
        open={open}
        onClose={handleMenuClose}
        sx={{
          '& ul[role="menu"]': {padding: 0},
          '& li': {padding: '0.6em 1em'},
          '& li:not(:last-of-type)': {borderBottom: '1px solid #e0e0e0'},
        }}
        MenuListProps={{'aria-labelledby': 'actions-button'}}
        anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
        transformOrigin={{vertical: 'top', horizontal: 'right'}}>
        {menuActions
          .filter((action) => action.visible)
          .map((action, index) => (
            <MenuItem
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick();
              }}>
              <Box sx={{display: 'flex', alignItems: 'center', gap: '0.5em'}}>
                {action.icon}
                <Typography variant="body2">{action.label}</Typography>
              </Box>
            </MenuItem>
          ))}
      </Menu>
    </Box>
  );
};

export default React.memo(Actions);
