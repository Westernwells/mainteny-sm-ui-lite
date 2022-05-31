import React, {ReactNode} from 'react';
import Box from '@mui/material/Box';
import {Typography} from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';

interface Props {
  children: ReactNode;
  containerStyle?: {[key: string]: string | number};
  setShowFilter?: (val: boolean) => void;
  showFilter?: boolean;
  hideClear?: boolean;
}

export const FilterFields = ({
  children,
  containerStyle,
  setShowFilter = () => {},
  hideClear,
  showFilter = true,
}: Props) => {
  const theme = useTheme();

  return showFilter ? (
    <Box display="flex" sx={{...containerStyle}}>
      <Box display="flex">{children}</Box>
      {!hideClear ? (
        <Typography
          onClick={() => setShowFilter(false)}
          mt="0.5em"
          sx={{cursor: 'pointer', color: theme.palette.info.main}}>
          Clear all
        </Typography>
      ) : null}
    </Box>
  ) : null;
};
