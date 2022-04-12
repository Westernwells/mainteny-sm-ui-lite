import Box from '@mui/material/Box';
import {ReactNode} from 'react';
import useTheme from '@mui/material/styles/useTheme';
import {Typography} from '@mui/material';

interface Props {
  children?: ReactNode;
  title?: string;
  subtitle?: string;
  width?: string;
  marginLeft?: string;
  height?: string;
  titleLeftAdornment?: JSX.Element;
  cardStatusAccent?: string;
}

export const ScheduleItem = ({
  children,
  title,
  width,
  marginLeft,
  titleLeftAdornment,
  subtitle,
  height,
  cardStatusAccent,
  ...rest
}: Props) => {
  console.log(cardStatusAccent, '@@@@###');
  const theme = useTheme();
  return (
    <Box
      {...rest}
      component="div"
      sx={{
        position: 'absolute',
        height: height || '50px',
        top: '-24px',
        background: theme.palette.secondary.outlinedHoverBg,
        overflowX: 'hidden',
        width,
        marginLeft,
        borderLeft: `2px solid ${cardStatusAccent}`,
      }}>
      {children || title ? (
        <Box sx={{display: 'flex', flexDirection: 'column', my: '0.5em'}}>
          <Box sx={{px: '0.5em', display: 'flex'}}>
            <Box> {titleLeftAdornment}</Box>
            <Typography
              component="div"
              variant="badge"
              sx={{
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                marginLeft: '0.5em',
              }}>
              {title}
            </Typography>
          </Box>
          <Typography
            component="div"
            variant="tooltip"
            sx={{
              px: '0.5em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              mt: '0.5em',
            }}>
            {subtitle}
          </Typography>
        </Box>
      ) : null}
    </Box>
  );
};
