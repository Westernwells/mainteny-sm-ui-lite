import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, {SelectChangeEvent} from '@mui/material/Select';

interface Props {
  handleChange: (event: SelectChangeEvent) => void;
  options: {label: any; value: any}[];
  label: string;
  defaultOption: any;
  size: 'small' | 'medium';
}

export const CustomSelect = ({
  handleChange,
  options,
  label,
  defaultOption,
  size,
}: Props) => (
  <FormControl size={size} sx={{width: '5rem'}}>
    <InputLabel id="demo-simple-select-label">{label}</InputLabel>
    <Select
      labelId="demo-simple-select-label"
      id="demo-simple-select"
      value={defaultOption}
      label={label}
      onChange={handleChange}>
      {options.map((option, index) => (
        <MenuItem value={option.value} key={index}>
          {option.label}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);
