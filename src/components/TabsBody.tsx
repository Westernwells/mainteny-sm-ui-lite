import React from 'react';
import Box from '@mui/material/Box';

interface Props {
  value: number;
  index: number;
  children: React.ReactNode | null;
  containerStyle?: {[key: string]: string | number};
}

export const TabsBody = ({value, index, children, containerStyle}: Props) =>
  value === index ? (
    <Box
      sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        ...containerStyle,
      }}>
      {children}
    </Box>
  ) : null;
