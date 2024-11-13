import Menu from '@mui/material/Menu';
import {Divider, ListItemButton, ListItemText, MenuItem} from '@mui/material';
import {useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import IconButton from '@mui/material/IconButton';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import {Action} from '../../../models/table';

type Props = {
  options: Action[];
  isOpen?: boolean; // optional when states need to be external
  onToggle?: (value: boolean) => void;
};

const TableActionMenu = ({
  isOpen: externalOpenState,
  options,
  onToggle: externalSetOpenState,
}: Props) => {
  const {t} = useTranslation();

  const anchorEl = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState<boolean>(false);

  const handleToggleMenu = (value: boolean) => () => {
    if (externalSetOpenState) {
      externalSetOpenState?.(value);
      return;
    }
    setOpen(value);
  };

  return (
    <>
      <IconButton
        id="employee-action-menu-button"
        ref={anchorEl}
        onClick={handleToggleMenu(true)}
        sx={{padding: 0}}>
        <MoreVertOutlinedIcon />
      </IconButton>

      <Menu
        open={externalOpenState !== undefined ? externalOpenState : open}
        anchorEl={anchorEl.current}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        onClose={handleToggleMenu(false)}>
        {options.map((option, index) => {
          const IconComponent = option.icon;
          return [
            <MenuItem
              key={`menu-action-option-${index}`}
              sx={{display: 'flex'}}
              onClick={option.onTrigger}>
              <ListItemButton
                sx={{flex: '0 0 auto', p: 0, pr: 1}}
                component="a">
                <IconComponent
                  fontSize="medium"
                  sx={{color: 'text.secondary'}}
                />
              </ListItemButton>
              <ListItemText
                sx={{
                  align: 'left',
                  typography: 'body2',
                  color: 'primary.dark',
                }}>
                {t(option.label)}
              </ListItemText>
            </MenuItem>,
            index < options.length - 1 && (
              <Divider
                sx={{my: 0.5, borderColor: 'action.disabledBackground'}}
              />
            ),
          ];
        })}
      </Menu>
    </>
  );
};

export default TableActionMenu;
