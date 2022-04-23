import Box, {BoxProps} from '@mui/material/Box';
import {ReactNode} from 'react';
import useTheme from '@mui/material/styles/useTheme';

// TODO: create different size Props
// const small = '';
// const medium = '';
// const large = ''

interface Props extends BoxProps {
  containerStyles?: {[key: string]: any};
  children?: ReactNode;
  color?: 'success' | 'error' | 'warning';
}

export const StatusIndicator = ({
  containerStyles,
  children,
  color = 'success',
  ...rest
}: Props) => {
  const theme = useTheme();
  return (
    <Box sx={{display: 'flex', ...containerStyles}} {...rest}>
      <Box
        sx={{
          width: '0.7rem',
          height: '0.7rem',
          borderRadius: '50%',
          background: theme.palette[color].main,
          mt: '0.5em',
          mr: '0.2em',
        }}
      />
      <Box>{children ? <Box>{children}</Box> : null}</Box>
    </Box>
  );
};
