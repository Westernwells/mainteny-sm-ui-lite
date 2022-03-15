import {ReactNode} from 'react';
import Box from '@mui/material/Box';
import {Typography} from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';

interface Props {
  children: ReactNode;
  containerStyle?: {[key: string]: string | number};
  setShowFilter: (state: boolean) => void;
}

export const FilterFields = ({
  children,
  containerStyle,
  setShowFilter,
}: Props) => {
  const theme = useTheme();
  return (
    <Box display="flex" justifyContent="space-between" sx={{...containerStyle}}>
      <Box display="flex">{children}</Box>
      <Typography
        onClick={() => setShowFilter(false)}
        mt={2}
        sx={{cursor: 'pointer', color: theme.palette.info.main}}
      >
        Clear all
      </Typography>
    </Box>
  );
};
