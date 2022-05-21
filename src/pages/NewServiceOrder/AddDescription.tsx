import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {PageCard} from 'components/PageCard';
import React, {useEffect, useState} from 'react';

interface Props {
  getDescription?: (val: string) => void;
  initialDescription?: string;
}

export const AddDescription = ({
  getDescription,
  initialDescription = '',
}: Props) => {
  const [description, setDescription] = useState(initialDescription);

  useEffect(() => {
    if (getDescription) {
      getDescription(description);
    }
  }, [description]);

  return (
    <>
      <Box>
        <Typography variant="subtitle2" color="grey.700">
          Selected Unit
        </Typography>
      </Box>
      <PageCard
        customHeader={
          <Typography variant="subtitle2" color="grey.700">
            Description (Optional)
          </Typography>
        }
        containerStyles={{mt: '2em'}}>
        <TextField
          value={description}
          id="pin"
          name="pin"
          size="medium"
          fullWidth
          type="text"
          onChange={(e) => setDescription(e.target.value)}
        />
      </PageCard>
    </>
  );
};
