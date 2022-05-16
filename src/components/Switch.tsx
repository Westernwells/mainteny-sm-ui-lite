import {ChangeEvent, useEffect, useState} from 'react';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import MuiSwitch from '@mui/material/Switch';

interface Props {
  label?: string | JSX.Element;
  getValue?: (val: boolean) => void;
}

export const Switch = ({label = '', getValue}: Props) => {
  const [checked, setChecked] = useState(true);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  };

  useEffect(() => {
    if (getValue) {
      getValue(checked);
    }
  }, [checked]);

  return (
    <FormGroup>
      <FormControlLabel
        control={<MuiSwitch checked={checked} onChange={handleChange} />}
        label={label}
      />
    </FormGroup>
  );
};
