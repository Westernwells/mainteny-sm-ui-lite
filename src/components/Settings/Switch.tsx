import {ChangeEvent, useState} from 'react';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import MuiSwitch from '@mui/material/Switch';
import {useTranslation} from 'react-i18next';

interface Props {
  label?: string | JSX.Element;
  value?: boolean;
  onValueChange?: (val: boolean) => void;
}

export const Switch = ({label = '', value, onValueChange}: Props) => {
  const {t} = useTranslation();

  // Use the value prop directly as the initial state
  const [checked, setChecked] = useState<boolean>(value || false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    setChecked(newValue);

    // Call the callback function with the new value
    onValueChange?.(newValue);
  };

  return (
    <FormGroup>
      <FormControlLabel
        control={<MuiSwitch checked={checked} onChange={handleChange} />}
        label={t(`${label}`)}
      />
    </FormGroup>
  );
};
