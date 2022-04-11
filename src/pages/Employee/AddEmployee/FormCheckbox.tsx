import {ChangeEvent} from 'react';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Checkbox from '@mui/material/Checkbox';

interface Props {
  options: {checked: boolean; name: string; label: JSX.Element | 'string'}[];
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export const FormCheckbox = ({options, onChange}: Props) => (
  <Box sx={{display: 'flex', mx: '.25em'}}>
    <FormControl component="fieldset" variant="standard">
      <FormGroup
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          columnGap: '1em',
        }}>
        {options.map((item) => (
          <FormControlLabel
            key={item.name}
            control={
              <Checkbox
                checked={item.checked}
                onChange={onChange}
                name={item.name}
              />
            }
            label={item.label}
          />
        ))}
      </FormGroup>
    </FormControl>
  </Box>
);
