import React, {useRef, useState} from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import {Action} from 'models/table';
import {t} from 'i18next';

type Props = {
  options: Action[];
  isOpen?: boolean;
  onToggle?: (value: boolean) => void;
};

const TableActionMenu = ({
  options,
  isOpen: externalOpenState,
  onToggle: externalSetOpenState,
}: Props) => {
  const anchorEl = useRef<HTMLButtonElement | null>(null);
  const [internalOpen, setInternalOpen] = useState(false);

  const isOpen =
    externalOpenState !== undefined ? externalOpenState : internalOpen;
  const setOpen = externalSetOpenState || setInternalOpen;

  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);

  return (
    <>
      <IconButton
        ref={anchorEl}
        onClick={handleOpen}
        aria-controls={isOpen ? 'action-menu' : undefined}
        aria-haspopup="true">
        <MoreVertOutlinedIcon />
      </IconButton>
      <Menu
        id="action-menu"
        anchorEl={anchorEl.current}
        open={isOpen}
        onClose={handleClose}
        anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
        transformOrigin={{vertical: 'top', horizontal: 'right'}}>
        {options.map((option, index) => (
          <MenuItem
            key={index}
            onClick={() => {
              option.onTrigger();
              handleClose();
            }}>
            <option.icon style={{marginRight: '8px'}} />
            {t(option.label)}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default TableActionMenu;
