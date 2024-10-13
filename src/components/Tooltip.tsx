import MuiTooltip, {TooltipProps} from '@mui/material/Tooltip';
import React, {ReactElement} from 'react';

interface Props extends TooltipProps {
  children: ReactElement;
}

export const Tooltip = ({children, ...rest}: Props) => (
  <MuiTooltip
    slotProps={{
      tooltip: {
        sx: {
          bgcolor: 'common.white',
          '& .MuiTooltip-arrow': {
            color: 'common.black',
          },
        },
      },
    }}
    arrow
    {...rest}>
    {children}
  </MuiTooltip>
);
