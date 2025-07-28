import MenuLib from '@mui/material/Menu';
import {Box} from '@mui/material';
import Divider from '@mui/material/Divider';
import {MenuAction} from 'models/action';
import {SxProps} from '@mui/system';
import Menu from './Menu';

type Props = {
  options: MenuAction[];
  isOpen: boolean;
  anchorEl: HTMLButtonElement | null;
  sx?: SxProps;
  onClose: () => void;
};

const TableActionMenu = ({options, isOpen, anchorEl, sx, onClose}: Props) => {
  if (anchorEl && !isOpen) return;

  return (
    <MenuLib
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
          <Menu sx={sx} option={option} onClose={onClose} index={index} />
          {option.showBorder && <Divider />}
        </Box>
      ))}
    </MenuLib>
  );
};

export default TableActionMenu;
