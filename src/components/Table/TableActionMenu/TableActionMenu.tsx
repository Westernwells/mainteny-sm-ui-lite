import Menu from '@mui/material/Menu';
import {Box} from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import React from 'react';
import {MenuAction} from 'models/action';
import {t} from 'i18next';

type Props = {
  options: MenuAction[];
  isOpen: boolean;
  anchorEl: HTMLButtonElement | null;
  onClose: () => void;
};

const TableActionMenu = ({options, isOpen, anchorEl, onClose}: Props) => {
  if (anchorEl && !isOpen) return;
  return (
    <Menu
      id="action-menu"
      anchorEl={anchorEl}
      open={isOpen}
      onClose={onClose}
      anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
      transformOrigin={{vertical: 'top', horizontal: 'right'}}>
      {options.map((option, index) => (
        <Box
          key={`container-menu-option-${option.label}-${index}`}
          data-testid={`container-menu-option-${option.label}-${index}`}>
          <MenuItem
            key={`option-menu-index-${index}`}
            data-testid={`option-menu-index-${index}`}
            onClick={() => {
              option.onClick();
              onClose();
            }}>
            <ListItemIcon>{option.icon}</ListItemIcon>
            <ListItemText>
              <Typography variant="body2">{t(option.label)}</Typography>
            </ListItemText>
          </MenuItem>
          {option.showBorder && <Divider />}
        </Box>
      ))}
    </Menu>
  );
};

export default TableActionMenu;
