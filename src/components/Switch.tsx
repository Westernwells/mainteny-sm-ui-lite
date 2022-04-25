import * as React from 'react';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import MuiSwitch from '@mui/material/Switch';

interface Props {
  label: string;
}

export const Switch = ({label}: Props) => (
  <FormGroup>
    <FormControlLabel control={<MuiSwitch defaultChecked />} label={label} />
  </FormGroup>
);
