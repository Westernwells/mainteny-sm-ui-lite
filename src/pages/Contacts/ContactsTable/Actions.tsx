import React, {useState} from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Typography from '@mui/material/Typography';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import {Box} from '@mui/material';
import {useTranslation} from 'react-i18next';

export interface IActions {
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onShowDetails: (id: string) => void;
  onSendEmail: (id: string) => void;
}

interface Props {
  contactId: string;
}

interface ActionButton {
  icon: JSX.Element;
  label: string;
  onClick: () => void;
}

const Actions = ({
  contactId,
  onDelete,
  onEdit,
  onShowDetails,
  onSendEmail,
}: Props & IActions) => {
  const {t} = useTranslation();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const actionButtons: ActionButton[] = [
    {
      icon: <SendOutlinedIcon sx={{color: 'text.secondary'}} />,
      label: 'Send email',
      onClick: () => onSendEmail(contactId),
    },
    {
      icon: <InfoOutlinedIcon sx={{color: 'text.secondary'}} />,
      label: 'Show details',
      onClick: () => onShowDetails(contactId),
    },
    {
      icon: <EditOutlinedIcon sx={{color: 'text.secondary'}} />,
      label: 'Edit',
      onClick: () => onEdit(contactId),
    },
    {
      icon: <DeleteOutlinedIcon sx={{color: 'text.secondary'}} />,
      label: 'Delete',
      onClick: () => onDelete(contactId),
    },
  ];

  return (
    <Box>
      <IconButton
        size="small"
        onClick={(event) => {
          event.stopPropagation();
          setAnchorEl(event.currentTarget);
        }}
        sx={{ml: '.25em'}}>
        <MoreVertIcon
          sx={{color: open ? 'primary.main' : 'action.active'}}
          fontSize="small"
        />
      </IconButton>
      <Menu
        id="actions-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        sx={{
          minWidth: '12.5em',
          '& ul[role="menu"]': {
            padding: 0,
          },
          '& li': {
            padding: '0.6em 1em',
          },
          '& li:not(:last-of-type)': {
            borderBottom: '1px solid #e0e0e0',
          },
        }}
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
            width: 180,
          },
        }}>
        {actionButtons.map((action, index) => (
          <MenuItem
            key={index}
            onClick={() => {
              handleClose();
              action.onClick();
            }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5em',
              }}>
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
