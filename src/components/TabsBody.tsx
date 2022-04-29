import React from 'react';
import Box from '@mui/material/Box';

interface Props {
  value: number;
  index: number;
  children: React.ReactNode | null;
}

export const TabsBody = ({value, index, children}: Props) =>
  value === index ? (
    <Box
      sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
      }}>
      {children}
    </Box>
  ) : null;
