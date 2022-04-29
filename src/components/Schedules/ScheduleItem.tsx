import Box from '@mui/material/Box';
import {ReactElement} from 'react';
import useTheme from '@mui/material/styles/useTheme';
import {Typography} from '@mui/material';
import {Tooltip} from 'components/Tooltip';

interface Props {
  children?: ReactElement;
  title?: string;
  subtitle?: string;
  width?: string;
  position?: string;
  height?: string;
  titleLeftAdornment?: JSX.Element;
  cardStatusAccent?: string;
  tooltip: ReactElement;
  containerStyle?: {[key: string]: string | number};
}

export const ScheduleItem = ({
  children,
  title,
  width,
  position,
  titleLeftAdornment,
  subtitle,
  height,
  cardStatusAccent,
  tooltip,
  containerStyle,
  ...rest
}: Props) => {
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
        transform: `translateX(${position})`,
        // marginLeft: position,
        borderLeft: `2px solid ${cardStatusAccent}`,
        cursor: 'pointer',
        overflowY: 'hidden',
        ...containerStyle,
      }}>
      <Tooltip title={tooltip} placement="top">
        {children || (
          <Box sx={{display: 'flex', flexDirection: 'column', my: '0.5em'}}>
            <Box sx={{px: '0.5em', display: 'flex'}}>
              <Box> {titleLeftAdornment}</Box>
              <Typography
                component="div"
                variant="inputLabel"
                sx={{
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  marginLeft: '0.5em',
                  mt: '0.3em',
                }}>
                {title}
              </Typography>
            </Box>
            <Typography
              component="div"
              variant="caption"
              sx={{
                px: '0.5em',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
              {subtitle}
            </Typography>
          </Box>
        )}
      </Tooltip>
    </Box>
  );
};
