import Box from '@mui/material/Box';
import {grey} from '@mui/material/colors';
// import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {FormInput} from 'components/form/FormInput';
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
        <FormInput
          props={{
            sx: {background: grey[50], border: 'none'},
            value: description,
            size: 'medium',
            fullWidth: true,
            type: 'text',
            onChange: (e) => setDescription(e.target.value),
          }}
        />
      </PageCard>
    </>
  );
};
