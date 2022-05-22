import Box from '@mui/material/Box';
import {grey} from '@mui/material/colors';
import Typography from '@mui/material/Typography';
import {FormInput} from 'components/form/FormInput';
import {PageCard} from 'components/PageCard';
import {ElevatorView} from 'models/elevator';
import {TechnicianView} from 'models/technician';
import React, {useEffect, useState} from 'react';

interface Props {
  getDescription?: (val: string) => void;
  initialDescription?: string;
  selectedUnit?: ElevatorView;
  selectedTechnicians?: TechnicianView[];
}

export const AddDescription = ({
  getDescription,
  initialDescription = '',
  selectedUnit,
  selectedTechnicians = [],
}: Props) => {
  const [description, setDescription] = useState(initialDescription);

  useEffect(() => {
    if (getDescription) {
      getDescription(description);
    }
  }, [description]);

  const summaryList = (value: string) => (
    <Typography variant="body2" color="grey.700" sx={{mt: '0.2em'}}>
      {value}
    </Typography>
  );

  return (
    <>
      {selectedUnit ? (
        <Box>
          <Typography variant="subtitle2" color="grey.700">
            Selected Unit
          </Typography>
          {summaryList(selectedUnit?.model)}
        </Box>
      ) : null}

      {selectedTechnicians.length ? (
        <Box sx={{mt: '1em'}}>
          <Typography variant="subtitle2" color="grey.700">
            Selected Technician
          </Typography>
          {selectedTechnicians.map((item) =>
            summaryList(
              `${item.userAccount.firstName} ${item.userAccount.lastName}`,
            ),
          )}
        </Box>
      ) : null}
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
