import {ReactNode} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface Props {
  children: ReactNode;
  renderWidget?: JSX.Element;
  label: string;
}

export const PageOverviewLayout = ({children, renderWidget, label}: Props) => (
  <>
    <Box display="flex" justifyContent="space-between" mb="1em">
      <Typography variant="h5" mt="0.3em">
        {label}
      </Typography>
      <Box>{renderWidget || null}</Box>
    </Box>
    {children}
  </>
);
