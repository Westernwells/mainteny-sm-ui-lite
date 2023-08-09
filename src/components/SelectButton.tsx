import {MouseEventHandler} from 'react';
import Box from '@mui/material/Box';
import {SxProps, Theme} from '@mui/system';
import {Button} from './Button';

interface Props {
  text: string;
  icon?: JSX.Element;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  sxContainer?: SxProps<Theme>;
}

export const SelectButton = ({text, icon, onClick, sxContainer}: Props) => (
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
        size: 'medium',
        variant: 'outlined',
        sx: {
          color: 'primary.main',
          background: 'transparent',
          textTransform: 'none',
        },
        startIcon: icon,
        onClick,
      }}
    />
  </Box>
);
