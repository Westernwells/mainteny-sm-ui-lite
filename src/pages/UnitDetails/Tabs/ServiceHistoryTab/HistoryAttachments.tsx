import Box from '@mui/material/Box';
import React from 'react';

interface Props {
  downloadUrl?: string[];
}

export const HistoryAttachments = ({downloadUrl}: Props) => (
  <Box sx={{display: 'flex', flexWrap: 'wrap'}}>
    {downloadUrl?.map((item) => (
      <Box
        sx={{
          width: '10.0625rem',
          height: '7.5rem',

          borderRadius: 1,
          mr: '1em',

          mt: '0.5em',
        }}
      >
        <img
          src={item}
          alt=""
          style={{objectFit: 'cover', height: '100%', width: '100%'}}
        />
      </Box>
    ))}
  </Box>
);
