import Box from '@mui/material/Box';
import Button, {ButtonProps} from '@mui/material/Button';
import Menu, {MenuProps} from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import {MenuBtnProps} from 'models/misc';
import {MouseEvent, useState} from 'react';

interface Props extends ButtonProps {
  label: string | JSX.Element;
  menu: MenuBtnProps[];
  startIcon?: JSX.Element;
  endIcon?: JSX.Element;
  menuProps?: MenuProps;
}

export const MenuBtn = ({
  label,
  menu,
  startIcon,
  endIcon,
  menuProps,
  ...rest
}: Props) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box>
      <Button
        startIcon={startIcon}
        endIcon={endIcon}
        onClick={handleClick}
        {...rest}>
        {label}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
        {...menuProps}>
        {menu.map((item, index) => (
          <MenuItem key={index} onClick={item.action}>
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};
