/* eslint-disable */
import {ReactNode} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {FlexContainer} from './FlexContainer';

interface Props {
  children: ReactNode;
  renderWidget?: JSX.Element;
  label?: string; // remoce later
}

export const PageListingLayout = ({children, renderWidget, label}: Props) => (
  <FlexContainer>
    <Box display="flex" justifyContent="space-between" mb="1em">
      {/* <Typography variant="h5" mt="0.3em">
        {label}
      </Typography> */}
      {renderWidget || null}
    </Box>
    {children}
  </FlexContainer>
);
