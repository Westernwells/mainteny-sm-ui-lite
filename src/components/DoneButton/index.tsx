import React from 'react';
import DoneIcon from '@mui/icons-material/Done';
import {IconButton} from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';

interface Props {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}

export const DoneButton = ({onClick, disabled = false}: Props) => {
  const theme = useTheme();

  return (
    <IconButton
      onClick={onClick}
      disabled={disabled}
      sx={{
        backgroundColor: theme.palette.success.darkSuccess,
        p: 0.4,
        '&.MuiIconButton-root:hover': {
          backgroundColor: theme.palette.success.darkSuccess,
        },
        '&.Mui-disabled': {
          backgroundColor: theme.palette.success.darkSuccess,
          opacity: 0.4,
        },
      }}>
      <DoneIcon sx={{width: 20, height: 20}} htmlColor="white" />
    </IconButton>
  );
};
