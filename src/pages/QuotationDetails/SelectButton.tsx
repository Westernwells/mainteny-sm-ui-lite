import {MouseEventHandler} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import {SxProps, Theme} from '@mui/system';

interface Props {
  text: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  sxContainer?: SxProps<Theme>;
}

export const SelectButton = ({text, onClick, sxContainer}: Props) => (
  <Box
    bgcolor="inputBackground.main"
    py="1.5em"
    display="flex"
    justifyContent="center"
    border="1px dashed"
    borderColor="text.disabled"
    sx={sxContainer}>
    <Button
      variant="outlined"
      onClick={onClick}
      sx={{textTransform: 'capitalize'}}>
      {text}
    </Button>
  </Box>
);
