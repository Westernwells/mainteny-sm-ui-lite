import React, {useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import MUITooltip, {TooltipProps} from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import MoreIcon from '@mui/icons-material/MoreVert';

import DeleteIcon from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import {EmployeeEventTypeRecord} from 'models/employee';

const Tooltip = ({children, ...props}: TooltipProps) => (
  <MUITooltip
    PopperProps={{
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [0, -10],
          },
        },
      ],
    }}
    {...props}>
    {children}
  </MUITooltip>
);

interface Props {
  onEdit: (event: EmployeeEventTypeRecord) => void;
  onDelete: (event: EmployeeEventTypeRecord) => void;
  eventType: EmployeeEventTypeRecord;
  disabled?: boolean;
}

export const Actions = ({
  onEdit,
  onDelete,
  eventType,
  disabled = false,
}: Props) => {
  const {t} = useTranslation();

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const actions = useMemo(() => {
    const items = [
      {
        label: t('Edit'),
        icon: <Edit />,
        onClick: () => {
          onEdit(eventType);
        },
      },
      {
        label: t('Delete'),
        icon: <DeleteIcon />,
        onClick: () => {
          onDelete(eventType);
        },
      },
    ];

    return items;
  }, [t, eventType]);

  return (
    <Box>
      <Tooltip title={t('More')} placement="right" arrow>
        <IconButton disabled={disabled} onClick={handleClick}>
          <MoreIcon fontSize="small" sx={{color: 'action.active'}} />
        </IconButton>
      </Tooltip>
      <Menu
        id="actions-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'actions-button',
          sx: {width: '210px'},
        }}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}>
        {actions.map((item, index) => (
          <Box key={`${item.label}-${index}`}>
            {(actions.length > 3 && actions.length - 3 < index) ||
            (actions.length <= 3 && actions.length - 1 === index) ? (
              <Divider />
            ) : null}
            <MenuItem
              onClick={() => {
                item.onClick();
                handleClose();
              }}
              sx={{py: '0.7rem'}}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText>
                <Typography variant="body2">{item.label}</Typography>
              </ListItemText>
            </MenuItem>
          </Box>
        ))}
      </Menu>
    </Box>
  );
};
