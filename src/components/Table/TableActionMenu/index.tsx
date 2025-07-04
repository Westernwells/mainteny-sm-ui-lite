import React, {useRef, useState} from 'react';
import IconButton from '@mui/material/IconButton';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import {MenuAction} from 'models/action';
import TableActionMenu from './TableActionMenu';

type Props = {
  options: MenuAction[];
  isOpen?: boolean;
  onToggle?: (value: boolean) => void;
  testId?: string;
};

const TableActionMenuWithButton = ({
  options,
  isOpen: externalOpenState,
  onToggle: externalSetOpenState,
  testId,
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
        data-testid={testId}
        ref={anchorEl}
        onClick={handleOpen}
        aria-controls={isOpen ? 'action-menu-vertical' : undefined}
        aria-haspopup="true">
        <MoreVertOutlinedIcon />
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

export default TableActionMenuWithButton;
