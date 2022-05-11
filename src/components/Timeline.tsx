import React, {ReactNode} from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import useTheme from '@mui/material/styles/useTheme';

interface Props {
  header?: string | ReactNode;
  body?: string | ReactNode;
  footer?: string | ReactNode;
  containerStyle?: {[key: string]: string | number};
  hideLeftBorder?: boolean;
  value: number;
}

export const Timeline = ({
  header,
  body,
  footer,
  containerStyle,
  hideLeftBorder,
  value,
}: Props) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        ...containerStyle,
      }}>
      <Box
        sx={{
          position: 'relative',
          minHeight: '3rem',
          '&::before': {
            content: `"${value}"`,
            display: 'block',
            borderRadius: '50%',
            textAlign: 'center',
            height: '1.5rem',
            width: '1.5rem',
            position: 'absolute',
            top: 0,
            left: '-0.7rem',
            background: theme.palette.text.secondary,
            color: '#fff',
            zIndex: 5,
          },
        }}>
        <Box
          sx={{
            p: '0 2.5em',
            position: 'relative',
            minHeight: '5rem',
            '&::before': {
              content: '""',
              borderLeft: hideLeftBorder ? 'none' : '1px solid',
              borderLeftColor: 'grey.400',
              position: 'absolute',
              left: 0,
              height: '70%',
              marginTop: '2em',
              display: 'block',
            },
            // mt: '0.5em'
          }}>
          {header ? <Typography variant="body1">{header}</Typography> : header}
          {body ? (
            <Typography variant="caption" component="div">
              {body}
            </Typography>
          ) : (
            body
          )}

          {footer ? (
            <Typography variant="caption" component="div">
              {footer}
            </Typography>
          ) : (
            footer
          )}
        </Box>
      </Box>
    </Box>
  );
};
