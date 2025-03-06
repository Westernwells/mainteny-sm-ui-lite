import {PropsWithChildren} from 'react';
import {Box, BoxProps} from '@mui/system';

interface PageHeaderContainerProps extends BoxProps {}

const PageHeaderContainer = ({
  children,
  sx,
}: PropsWithChildren<PageHeaderContainerProps>) => (
  <Box
    data-testid="page-header-container"
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      flex: '0 1 auto',
      ...sx,
    }}>
    {children}
  </Box>
);

export default PageHeaderContainer;
