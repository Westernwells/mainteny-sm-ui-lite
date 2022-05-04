import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select, {SelectChangeEvent} from '@mui/material/Select';

interface Props<T> {
  labelId: string;
  label: string;
  id: string;
  value: string[];
  options: string[];
  onChange: (event: SelectChangeEvent<T[]>) => void;
  disabled?: boolean;
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export const FormSelect = ({
  labelId,
  label,
  id,
  value,
  options,
  onChange,
  disabled,
}: Props<string>) => (
  <FormControl sx={{marginBlock: '.75em'}} fullWidth>
    <InputLabel
      id={labelId}
      shrink
      sx={{
        bgcolor: 'white',
        paddingInline: '.5em 2em',
      }}>
      {label}
    </InputLabel>
    <Select
      size="small"
      multiple
      labelId={labelId}
      id={id}
      value={value}
      onChange={onChange}
      input={<OutlinedInput id="roles" />}
      renderValue={() => value.join(',')}
      MenuProps={MenuProps}
      disabled={disabled}>
      {options.map((option) => (
        <MenuItem key={option} value={option}>
          <Checkbox size="small" checked={value.includes(option)} />
          {option}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);
