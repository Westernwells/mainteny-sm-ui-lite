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

  const [checked, setChecked] = useState<boolean>(value || false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    setChecked(newValue);

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
