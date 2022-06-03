import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select, {SelectProps} from '@mui/material/Select';

interface Props<T> {
  labelId: string;
  label: string;
  options: {label: string; value: string}[];
  selectProps?: SelectProps<T>;
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
  options,
  selectProps,
}: Props<string | string[]>) => (
  <FormControl sx={{marginBlock: '.75em'}} fullWidth>
    {console.log(selectProps, '~~~~~~~~!!')}
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
      input={<OutlinedInput id="roles" />}
      renderValue={() =>
        selectProps && selectProps.value && Array.isArray(selectProps.value)
          ? selectProps.value.join(',')
          : selectProps?.value || ''
      }
      MenuProps={MenuProps}
      {...selectProps}>
      {options.map((option) => (
        <MenuItem key={option.label} value={option.value}>
          {selectProps?.multiple ? (
            <Checkbox
              size="small"
              checked={
                selectProps && selectProps.value
                  ? selectProps.value.includes(option.value)
                  : false
              }
            />
          ) : null}
          {option.label}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);
