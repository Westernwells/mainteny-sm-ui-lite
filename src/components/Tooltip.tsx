import MuiTooltip, {TooltipProps} from '@mui/material/Tooltip';
import React, {ReactElement} from 'react';

interface Props extends TooltipProps {
  children: ReactElement;
}

export const Tooltip = ({children, ...rest}: Props) => (
  <MuiTooltip arrow {...rest}>
    {children}
  </MuiTooltip>
);
