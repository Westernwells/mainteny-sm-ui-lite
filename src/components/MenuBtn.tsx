import {useTranslation} from 'react-i18next';
import Box from '@mui/material/Box';
import Button, {ButtonProps} from '@mui/material/Button';
import Menu, {MenuProps} from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import {MenuBtnProps} from 'models/misc';
import IconButton from '@mui/material/IconButton';
import {MouseEvent, useState} from 'react';
import {ListItemIcon, MenuListProps} from '@mui/material';

interface Props extends ButtonProps {
  open?: boolean;
  label?: string | JSX.Element;
  menu: MenuBtnProps[];
  startIcon?: JSX.Element;
  endIcon?: JSX.Element;
  menuProps?: MenuProps;
  anchorType?: 'iconButton' | 'button';
  anchorIcon?: JSX.Element | null;
  disableIcon?: boolean;
  persistList?: boolean;
  menuListProps?: MenuListProps;
}

export const MenuBtn = ({
  open,
  label = '',
  menu,
  startIcon,
  endIcon,
  menuProps,
  anchorType = 'button',
  anchorIcon = null,
  disableIcon,
  persistList = false,
  menuListProps = {},
  ...rest
}: Props) => {
  const {t} = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const internalOpen = Boolean(anchorEl);
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box>
      {anchorType === 'button' ? (
        <Button
          startIcon={startIcon}
          endIcon={endIcon}
          onClick={handleClick}
          {...rest}>
          {typeof label === 'string' ? t(label) : label}
        </Button>
      ) : (
        <IconButton
          aria-label="more"
          id="long-button"
          aria-haspopup="true"
          onClick={handleClick}
          disabled={disableIcon}
          sx={{opacity: disableIcon ? 0.2 : 1}}>
          {anchorIcon}
        </IconButton>
      )}
      <Menu
        anchorEl={anchorEl}
        open={open !== undefined ? open : internalOpen}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
          ...menuListProps,
        }}
        {...menuProps}>
        {menu.map((item, index) => (
          <MenuItem
            key={index}
            onClick={(e) => {
              if (!persistList) {
                handleClose();
              }
              item.action(e);
            }}>
            {item.icon ? <ListItemIcon>{item.icon}</ListItemIcon> : null}
            {t(item.label)}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};
