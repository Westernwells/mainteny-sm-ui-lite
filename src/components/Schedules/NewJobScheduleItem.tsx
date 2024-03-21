import Box from '@mui/material/Box';
import {ComponentType, ReactElement} from 'react';
import {theme} from 'theme';
import {Tooltip} from 'components/Tooltip';
import {Props as NewJobOrderDetailsProps} from 'components/NewJobOrderDetails';
import {ServiceOrderView} from 'models/service-order';
import {ServiceOrderIcons} from 'components/ServiceOrderIcons';

interface Props {
  children?: ReactElement;
  width?: string;
  position?: {x: string; y: string};
  height?: string;
  tooltip: ComponentType<NewJobOrderDetailsProps>;
  order: ServiceOrderView;
  containerStyle?: {[key: string]: string | number};
}

export const NewJobScheduleItem = ({
  children,
  width,
  position,
  tooltip: TooltipComponent,
  order,
  containerStyle,
  ...rest
}: Props) => (
  <Box
    {...rest}
    component="div"
    sx={{
      display: 'flex',
      alignItems: 'center',
      gridColumn: 1,
      gridRow: Number(position?.y),
      background: '#0F4C6414',
      overflowX: 'hidden',
      width,
      transform: `translateX(${position?.x})`,
      border: `1px solid ${theme.palette.secondary.mainLight}`,
      borderRadius: 1,
      minWidth: '13px',
      minHeight: '40px',
      cursor: 'pointer',
      overflowY: 'hidden',
      '&:hover': {
        background: theme.palette.primary.dark,
      },
      ...containerStyle,
    }}>
    <Tooltip
      title={<TooltipComponent order={order} />}
      placement="top"
      componentsProps={{
        tooltip: {
          sx: {
            bgcolor: 'white',
            '& .MuiTooltip-arrow': {
              color: 'white',
            },
            padding: 2,
            boxShadow: '0px 4px 9px rgba(0, 0, 0, 0.09)',
            width: '15.25rem',
          },
        },
      }}>
      {children || (
        <Box
          width={width}
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={1}>
          <ServiceOrderIcons serviceOrderType={order.type} />
        </Box>
      )}
    </Tooltip>
  </Box>
);
