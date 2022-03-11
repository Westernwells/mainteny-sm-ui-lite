import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {ReactComponent as TechnicianIcon} from 'assets/icons/Technician.svg';

interface Props {
  label: JSX.Element | string | null;
}

export const HitoryCardEmptyState = ({label}: Props) => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    flexDirection="column"
  >
    <Typography variant="subtitle2">{label}</Typography>
    <Box>
      <TechnicianIcon
        style={{
          width: '12.5rem',
          height: '8.5625rem',
        }}
      />
    </Box>
  </Box>
);
