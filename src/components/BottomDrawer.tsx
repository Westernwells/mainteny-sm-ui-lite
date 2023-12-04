import React, {ReactNode, useState} from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import MuiButton from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import MoreIcon from '@mui/icons-material/MoreVert';
import {useTheme} from '@mui/material';
import {useTranslation} from 'react-i18next';

interface ListMenu {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  showBorder?: boolean;
}

interface Props {
  isOpen: boolean;
  isValid: boolean;
  primaryButtonLabel: string;
  primaryButtonAction: () => void;
  listItems: ListMenu[];
  secondaryButton?: React.ReactNode;
  isSaving?: boolean;
}

export const BottomDrawer = ({
  isOpen,
  isValid,
  primaryButtonLabel,
  primaryButtonAction,
  listItems,
  secondaryButton,
  isSaving,
}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();
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
          zIndex: '900',
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
        {secondaryButton}
        <ButtonGroup variant="contained">
          <MuiButton
            type="submit"
            disabled={!isValid || isSaving}
            onClick={primaryButtonAction}>
            {t(primaryButtonLabel)}
          </MuiButton>

          {listItems.length > 0 && (
            <IconButton
              disabled={!isValid || isSaving}
              onClick={handleClick}
              style={{
                backgroundColor: `${
                  isValid && !isSaving
                    ? theme.palette.primary.main
                    : theme.palette.action.disabledBackground
                }`,
              }}
              sx={{
                color: 'primary.contrastText',
                borderRadius: '0 4px 4px 0',
                overflow: 'hidden',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              }}>
              <MoreIcon />
            </IconButton>
          )}
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
        {listItems.map((item, index) => (
          <Box key={`${item.label}-${index}`}>
            <MenuItem
              onClick={() => {
                item.onClick();
                handleClose();
              }}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText>
                <Typography variant="body2">{item.label}</Typography>
              </ListItemText>
            </MenuItem>
            {item.showBorder && <Divider />}
          </Box>
        ))}
      </Menu>
    </Drawer>
  );
};
