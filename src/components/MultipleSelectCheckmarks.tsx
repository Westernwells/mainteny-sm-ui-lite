import * as React from 'react';
import useTheme from '@mui/material/styles/useTheme';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';

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

interface Props {
  options: string[];
  getSelectedValue?: (item: string[]) => void;
  label: string;
  multiple?: boolean;
  containerStyles?: {[key: string]: any};
  formControlStyles?: {[key: string]: any};
  initialSelectedItems?: string[];
}

export const MultipleSelectCheckmarks = ({
  options,
  getSelectedValue,
  label,
  multiple = true,
  containerStyles,
  formControlStyles,
  initialSelectedItems = [],
}: Props) => {
  const theme = useTheme();
  const [selectedItems, setSelectedItems] =
    React.useState<string[]>(initialSelectedItems);
  const visibility = selectedItems.length
    ? {visibility: 'visible'}
    : {visibility: 'hidden'};
  const handleChange = (event: SelectChangeEvent<typeof selectedItems>) => {
    const {
      target: {value},
    } = event;
    setSelectedItems(
      // On autofill we get a stringified value.
      typeof value === 'string'
        ? value.split(',').filter((item) => item.length)
        : value.filter((item) => item.length),
    );
  };

  React.useEffect(() => {
    if (getSelectedValue) {
      getSelectedValue(selectedItems);
    }
  }, [selectedItems]);

  React.useEffect(() => {
    setSelectedItems(initialSelectedItems);
  }, [initialSelectedItems]);
  return (
    <Box sx={{...containerStyles}}>
      <FormControl
        size="small"
        sx={{mr: '0.5em', width: '8.5rem', ...formControlStyles}}>
        <InputLabel id={label}>{label}</InputLabel>
        <Select
          id={label}
          multiple={multiple}
          value={selectedItems}
          onChange={handleChange}
          input={<OutlinedInput sx={{background: '#fff'}} label={label} />}
          renderValue={() => selectedItems.join(',')}
          MenuProps={MenuProps}>
          {!multiple ? (
            <MenuItem
              disableTouchRipple
              sx={{
                // height: '1em',
                overflow: 'hidden',
                backgroundColor: '#fff !important',
              }}
              value="">
              <ListItemText
                sx={{
                  textAlign: 'end',
                  color: theme.palette.info.main,
                  ...visibility,
                }}
                primary="Clear"
              />
            </MenuItem>
          ) : null}

          {multiple
            ? options.map((option) => (
                <MenuItem key={option} value={option}>
                  <Checkbox checked={selectedItems.includes(option)} />
                  <ListItemText primary={option} />
                </MenuItem>
              ))
            : options.map((option) => (
                <MenuItem key={option} value={option}>
                  <ListItemText primary={option} />
                </MenuItem>
              ))}
        </Select>
      </FormControl>
    </Box>
  );
};
