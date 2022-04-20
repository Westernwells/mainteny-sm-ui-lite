import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import {Theme, useTheme} from '@mui/material/styles';

interface Props<T> {
  labelId: string;
  label: string;
  id: string;
  value: string[];
  options: string[];
  onChange: (event: SelectChangeEvent<T[]>) => void;
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

function getStyles(name: string, personName: string[], theme: Theme) {
  return {
    fontWeight:
      personName.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

export const FormSelect = ({
  labelId,
  label,
  id,
  value,
  options,
  onChange,
}: Props<string>) => {
  const theme = useTheme();

  return (
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
        MenuProps={MenuProps}>
        {options.map((option) => (
          <MenuItem
            key={option}
            value={option}
            style={getStyles(option, options, theme)}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
