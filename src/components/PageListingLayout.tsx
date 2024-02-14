import {ReactNode} from 'react';
import Box from '@mui/material/Box';
import {FlexContainer} from './FlexContainer';

interface Props {
  children: ReactNode;
  containerStyle?: {[key: string]: any};
  renderWidget?: JSX.Element;
}

export const PageListingLayout = ({
  children,
  renderWidget,
  containerStyle,
}: Props) => (
  <FlexContainer containerStyle={containerStyle}>
    <Box display="flex" justifyContent="space-between">
      {renderWidget || null}
    </Box>
    {children}
  </FlexContainer>
);
