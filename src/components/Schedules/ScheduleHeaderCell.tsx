/* eslint-disable */
import {ReactNode} from 'react';
import useTheme from '@mui/material/styles/useTheme';
import {grey} from '@mui/material/colors';
import Typography from '@mui/material/Typography';
import Box, {BoxProps} from '@mui/material/Box';

interface Props extends BoxProps {
  label?: string | JSX.Element;
  children?: ReactNode;
  cellWidth?: string | number;
}

export const ScheduleHeaderCell = ({
  label,
  children,
  cellWidth = '120px',
  ...rest
}: Props) => {
  const theme = useTheme();
  return (
    <Box
      component="th"
      sx={{
        border: '0.5px solid #F1F5F9',
        borderTop: 'none',
        textAlign: 'left',
        height: '70px',
        width: cellWidth,
        color: grey[500], // TODO: add to theme
        ':first-child': {
          position: 'sticky',
          left: 0,
          zIndex: 2,
          pl: '1em',
          minWidth: '11.5rem',
          maxWidth: '11.5rem',
          background: '#fff',
          color: theme.palette.primary.main,
        },
      }}
      {...rest}>
      {typeof label === 'string' ? (
        <Typography variant="tableHeaderText">{label}</Typography>
      ) : (
        children
      )}
    </Box>
  );
};
