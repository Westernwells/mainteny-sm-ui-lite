/* eslint-disable */
import Box from '@mui/material/Box';
import {Label} from 'components/A4Layout';
import React from 'react';

export const ArticleHeader = () => {
  return (
    <Box
      px=".5em"
      sx={{
        display: 'grid',
        gridTemplateColumns: '3ch 2fr repeat(4, 10ch)',
        placeItems: 'center',
        gap: '0.5em',
      }}>
      <Label text="No" />
      <Label text="Description" sx={{justifySelf: 'start'}} />
      <Label text="Unit Price" />
      <Label text="Quantity" />
      <Label text="Unit" />
      <Box sx={{justifySelf: 'center'}}>
        <Label text="Total Price" sx={{display: 'block'}} />
        <Label text="(excl VAT)" />
      </Box>
    </Box>
  );
};
