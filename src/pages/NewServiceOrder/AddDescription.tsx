import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {PageCard} from 'components/PageCard';
import React from 'react';

export const AddDescription = () => {
  console.log('');
  return (
    <>
      <Box>
        <Typography variant="subtitle2" color="grey.700">
          Selected Unit
        </Typography>
      </Box>
      <PageCard headerLabel="Description (Optional)">
        <div>jdj</div>
      </PageCard>
    </>
  );
};
