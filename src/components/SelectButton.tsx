import {MouseEventHandler} from 'react';
import Box from '@mui/material/Box';
import {SxProps, Theme} from '@mui/system';
import {Button} from './Button';

interface Props {
  text: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  sxContainer?: SxProps<Theme>;
}

export const SelectButton = ({text, onClick, sxContainer}: Props) => (
  <Box
    bgcolor="inputBackground.main"
    minHeight="5em"
    display="flex"
    justifyContent="center"
    alignItems="center"
    border="1px dashed"
    borderColor="text.disabled"
    borderRadius=".25em"
    sx={sxContainer}>
    <Button
      label={text}
      buttonProps={{
        variant: 'outlined',
        onClick,
      }}
    />
  </Box>
);
