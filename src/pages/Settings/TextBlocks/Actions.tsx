import {useState} from 'react';
import Menu from '@mui/material/Menu';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import {Delete, Edit, MoreVert, RemoveRedEye} from '@mui/icons-material';
import {Box} from '@mui/material';
import {useTranslation} from 'react-i18next';

interface Props {
  onEdit: () => void;
  onDelete: () => void;
  onPreview: () => void;
}

interface ActionButton {
  icon: JSX.Element;
  label: string;
  onClick: () => void;
}

export const Actions = ({onEdit, onDelete, onPreview}: Props) => {
  const {t} = useTranslation();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const actionButtons: ActionButton[] = [
    {
      icon: <RemoveRedEye sx={{color: 'text.secondary'}} />,
      label: 'Preview',
      onClick: () => onPreview(),
    },
    {
      icon: <Edit sx={{color: 'text.secondary'}} />,
      label: 'Edit',
      onClick: () => onEdit(),
    },
    {
      icon: <Delete sx={{color: 'text.secondary'}} />,
      label: 'Delete',
      onClick: () => onDelete(),
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
        <MoreVert
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
