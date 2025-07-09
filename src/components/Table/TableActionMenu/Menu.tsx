import {
  ListItemIcon,
  ListItemText,
  Menu as MenuLib,
  MenuItem,
  Typography,
} from '@mui/material';
import {MenuAction} from 'models/action';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {SxProps} from '@mui/system';

type Props = {
  option: MenuAction;
  index: number;
  sx?: SxProps;
  onClose: () => void;
};

const Menu = ({option, index, sx, onClose}: Props) => {
  const {t} = useTranslation();
  const [submenuAnchorEl, setSubmenuAnchorEl] = useState<HTMLElement | null>(
    null,
  );
  const subMenus = option.subMenu ?? [];
  const hasSubMenu = subMenus.length > 0;
  const submenuOpen = Boolean(submenuAnchorEl);

  const handleSubMenuClose = () => {
    setSubmenuAnchorEl(null);
  };

  const handleMouseLeave = () => {
    setTimeout(() => {
      setSubmenuAnchorEl(null);
    }, 200); // slight delay to avoid flickering
  };

  return (
    <div onMouseLeave={handleMouseLeave}>
      <MenuItem
        key={`option-menu-index-${index}`}
        data-testid={`option-menu-index-${index}`}
        sx={sx}
        onClick={() => {
          if (option.onClick) option.onClick();
          if (!hasSubMenu) onClose();
        }}
        disabled={option.disabled}
        onMouseEnter={(e) => {
          setSubmenuAnchorEl(e.currentTarget);
        }}>
        <ListItemIcon>{option.icon}</ListItemIcon>
        <ListItemText sx={{marginRight: option.endIcon ? '10px' : 0}}>
          <Typography mt="3px" variant="body2">
            {t(option.label)}
          </Typography>
        </ListItemText>
        {!!option.endIcon && option.endIcon}
      </MenuItem>

      {hasSubMenu && (
        <MenuLib
          anchorEl={submenuAnchorEl}
          open={submenuOpen}
          onClose={handleSubMenuClose}
          anchorOrigin={{vertical: 'top', horizontal: 'left'}}
          transformOrigin={{vertical: 'top', horizontal: 'right'}}
          MenuListProps={{
            onMouseEnter: () => {},
            onMouseLeave: handleMouseLeave,
          }}>
          {subMenus.map((item, subMenuIndex) => (
            <Menu
              sx={sx}
              option={item}
              index={subMenuIndex}
              onClose={handleSubMenuClose}
              key={subMenuIndex}
            />
          ))}
        </MenuLib>
      )}
    </div>
  );
};

export default Menu;
