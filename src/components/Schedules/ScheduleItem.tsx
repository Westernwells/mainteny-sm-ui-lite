import Box from '@mui/material/Box';
import {ComponentType, ReactElement, useState} from 'react';
import useTheme from '@mui/material/styles/useTheme';
import {Typography} from '@mui/material';
import {Tooltip} from 'components/Tooltip';
import {Props as OrderDetailsProps} from 'components/OrderDetails';
import {ServiceOrderView} from 'models/service-order';

interface Props {
  children?: ReactElement;
  title?: string;
  subtitle?: string;
  width?: string;
  position?: {x: string; y: string};
  height?: string;
  titleLeftAdornment?: JSX.Element;
  cardStatusAccent?: string;
  tooltip: ComponentType<OrderDetailsProps>;
  order: ServiceOrderView;
  containerStyle?: {[key: string]: string | number};
}

export const ScheduleItem = ({
  children,
  title,
  width,
  position,
  titleLeftAdornment,
  subtitle,
  height = '60px',
  cardStatusAccent,
  tooltip: TooltipComponent,
  order,
  containerStyle,
  ...rest
}: Props) => {
  const [show, setShow] = useState(false);
  const theme = useTheme();
  const close = () => setShow(false);
  return (
    <Box
      {...rest}
      component="div"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gridColumn: 1,
        gridRow: Number(position?.y),
        height,
        background: theme.palette.info.infoAlert,
        overflowX: 'hidden',
        width,
        transform: `translateX(${position?.x})`,
        marginTop: '0.5em',
        border: `1px solid ${theme.palette.info.light}`,
        borderLeft: 'none',
        minWidth: '13px',
        minHeight: '65px',
        '&::before': {
          content: '""',
          width: '6px',
          height: '48px',
          borderTopRightRadius: '6px',
          borderBottomRightRadius: '6px',
          backgroundColor: cardStatusAccent,
          flex: 'none',
        },
        cursor: 'pointer',
        overflowY: 'hidden',
        ...containerStyle,
      }}>
      <Tooltip
        open={show}
        onOpen={() => setShow(true)}
        onClose={close}
        title={<TooltipComponent order={order} close={close} />}
        placement="top"
        componentsProps={{
          tooltip: {
            sx: {
              bgcolor: 'common.white',
              '& .MuiTooltip-arrow': {
                color: 'common.black',
              },
              padding: '1rem',
              boxShadow: '0px 4px 9px rgba(0, 0, 0, 0.09)',
              maxWidth: '14.25rem',
              marginRight: '33vw',
              marginLeft: '14vw',
            },
          },
        }}>
        {children || (
          <Box
            sx={{
              width,
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              my: '0.3em',
            }}>
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
                  lineHeight: 1.2,
                }}>
                {title}
              </Typography>
            </Box>
            <Typography
              component="div"
              variant="caption"
              color={theme.palette.primary.light}
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
