import {useCallback} from 'react';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import * as _ from 'lodash';

interface Props {
  placeholder?: string;
  onValueChanged?: (value: string) => void;
}

export const Searchnput = ({placeholder, onValueChanged}: Props) => {
  const debouncedChangeHandler = useCallback(
    _.debounce((e) => {
      onValueChanged?.(e.nativeEvent.target.value);
    }, 300),
    [],
  );

  return (
    <Paper
      component="form"
      sx={{
        p: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        boxShadow: 0,
        width: '23rem',
        border: '1px solid #E4E9F2',
        height: 48,
      }}>
      <IconButton
        type="submit"
        sx={{p: '10px'}}
        aria-label="search"
        onClick={(e) => e.preventDefault()}>
        <SearchIcon />
      </IconButton>
      <InputBase
        sx={{ml: 1, flex: 1}}
        placeholder={placeholder && placeholder}
        inputProps={{'aria-label': 'Type ‘Schindler’ or ‘Blue Plaza’'}}
        onChange={debouncedChangeHandler}
      />
    </Paper>
  );
};
