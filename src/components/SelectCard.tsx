import {ReactNode} from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

interface Props {
  header: ReactNode;
  body: ReactNode;
  onClose?: () => void;
}

export const SelectCard = ({header, body, onClose}: Props) => (
  <Box
    display="flex"
    bgcolor="#eeeeee"
    alignItems="start"
    justifyContent="space-between"
    px={1.5}
    py={1}
    border="1px solid"
    borderColor="text.disabled"
    borderRadius="4px"
    {...(!!body && {minHeight: '5em'})}>
    <Box>
      {header}
      <Box color="text.secondary">{body}</Box>
    </Box>
    {onClose && (
      <IconButton onClick={onClose} sx={{p: '0px'}}>
        <CloseIcon />
      </IconButton>
    )}
  </Box>
);
