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
            height: '1rem',
            width: '1rem',
            position: 'absolute',
            top: '15%',
            left: '-1%',
            border: `1px solid ${theme.palette.text.secondary}`,
            fontSize: '0rem',
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
              height: '50%',
              marginTop: '2em',
              display: 'block',
              top: '20%',
            },
          }}>
          {header ? (
            <Typography variant="body1" sx={{whiteSpace: 'pre-line'}}>
              {header}
            </Typography>
          ) : (
            header
          )}
          {body ? (
            <Typography
              variant="body2"
              color={theme.palette.text.secondary}
              component="div">
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
