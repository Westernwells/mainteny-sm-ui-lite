import React from 'react';
import {IconButton} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import useTheme from '@mui/material/styles/useTheme';

interface Props {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}

export const CrossButton = ({onClick, disabled = false}: Props) => {
  const theme = useTheme();

  return (
    <IconButton
      onClick={onClick}
      disabled={disabled}
      sx={{
        backgroundColor: theme.palette.error.light,
        p: 0.4,
        '&.MuiIconButton-root:hover': {
          backgroundColor: theme.palette.error.light,
        },
        '&.Mui-disabled': {
          backgroundColor: theme.palette.success.darkSuccess,
          opacity: 0.4,
        },
      }}>
      <CloseIcon sx={{width: 20, height: 20}} htmlColor="white" />
    </IconButton>
  );
};
