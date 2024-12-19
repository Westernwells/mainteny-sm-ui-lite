import {ButtonProps} from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import React, {useRef, useState} from 'react';
import TableActionMenu from 'components/Table/TableActionMenu/TableActionMenu';
import {MenuAction} from 'models/action';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

interface Props extends ButtonProps {
  isOpen?: boolean;
  options: MenuAction[];
  onToggle?: (value: boolean) => void;
}

const InfoCardMenu = ({
  isOpen: externalOpenState,
  options,
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
        key="action-menu-horizontal"
        data-testid="action-menu-horizontal"
        ref={anchorEl}
        onClick={handleOpen}
        aria-controls={isOpen ? 'action-menu-horizontal' : undefined}
        aria-haspopup="true">
        <MoreHorizIcon sx={{color: '#231F20'}} />
      </IconButton>
      <TableActionMenu
        isOpen={isOpen}
        onClose={handleClose}
        anchorEl={anchorEl.current}
        options={options}
      />
    </>
  );
};

export default InfoCardMenu;
