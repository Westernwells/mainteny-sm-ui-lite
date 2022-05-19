import {useCallback} from 'react';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import * as _ from 'lodash';
import {useTheme} from '@mui/material/styles';

const height = {
  small: 30,
  medium: 48,
  large: 60,
};

const iconSize = {
  small: 18,
  medium: 25,
  large: 40,
};

const placeHolderSize = {
  small: '0.7rem',
  medium: '1rem',
  large: '1.5rem',
};

interface Props {
  placeholder?: string;
  onValueChanged?: (value: string) => void;
  size?: 'small' | 'medium' | 'large';
  width?: string;
  containerStyle?: {[key: string]: string | number};
}

export const SearchInput = ({
  placeholder,
  onValueChanged,
  size,
  width,
  containerStyle,
}: Props) => {
  const theme = useTheme();
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
        width: width || '23rem',
        [theme.breakpoints.down('md')]: {
          height: '100%',
          width: '15rem',
        },
        border: '1px solid #E4E9F2',
        height: size ? height[size] : height.medium,
        ...containerStyle,
      }}>
      <InputBase
        sx={{
          ml: 1,
          flex: 1,
          fontSize: size ? placeHolderSize[size] : placeHolderSize.medium,
        }}
        placeholder={placeholder && placeholder}
        onChange={debouncedChangeHandler}
      />
      <IconButton
        type="submit"
        sx={{p: '10px'}}
        aria-label="search"
        onClick={(e) => e.preventDefault()}>
        <SearchIcon sx={{fontSize: size ? iconSize[size] : iconSize.medium}} />
      </IconButton>
    </Paper>
  );
};
