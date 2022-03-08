import React from 'react';
import Box from '@mui/material/Box';

interface Props {
  value: number;
  index: number;
  children: React.ReactNode | null;
}

export const TabsBody = ({value, index, children}: Props) => (
  <Box>{value === index ? children : null}</Box>
);
