import {ReactNode} from 'react';
import {SxProps, Theme} from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';
import {grey} from '@mui/material/colors';
import Typography from '@mui/material/Typography';
import Box, {BoxProps} from '@mui/material/Box';

interface Props extends BoxProps {
  label?: string;
  children?: ReactNode;
  cellWidth?: string | number;
  labelWidth?: string;
  containerStyles?: SxProps<Theme>;
}

export const ScheduleHeaderCell = ({
  label,
  children,
  cellWidth = '120px',
  labelWidth,
  containerStyles = {},
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
        height: '60px',
        minWidth: cellWidth,
        maxWidth: cellWidth,
        color: grey[500], // TODO: add to theme
        position: 'sticky',
        top: 0,
        background: '#fff',
        zIndex: 2,
        ':first-of-type': {
          left: 0,
          zIndex: 3,
          pl: '1em',
          minWidth: labelWidth || '11.5rem',
          color: theme.palette.primary.main,
        },
        ...containerStyles,
      }}
      {...rest}>
      {children || <Typography variant="tableHeaderText">{label}</Typography> ||
        null}
    </Box>
  );
};
