import Box from '@mui/material/Box';
import Button, {ButtonProps} from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import {MenuBtnProps} from 'models/misc';
import {MouseEvent, useState} from 'react';
import {useTranslation} from 'react-i18next';

interface Props extends ButtonProps {
  label: string | JSX.Element;
  menu: MenuBtnProps[];
  startIcon?: JSX.Element;
  endIcon?: JSX.Element;
}

export const MenuBtn = ({label, menu, startIcon, endIcon, ...rest}: Props) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const {t} = useTranslation();

  return (
    <Box>
      <Button
        startIcon={startIcon}
        endIcon={endIcon}
        onClick={handleClick}
        {...rest}>
        {t(`${label}`)}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}>
        {menu.map((item, index) => (
          <MenuItem key={index} onClick={item.action}>
            {t(item.label)}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};
