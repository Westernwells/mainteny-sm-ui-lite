import {PropsWithChildren} from 'react';
import {Box} from '@mui/system';

const PageHeaderContainer = ({children}: PropsWithChildren<unknown>) => (
  <Box
    data-testid="page-header-container"
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      flex: '0 1 auto',
    }}>
    {children}
  </Box>
);

export default PageHeaderContainer;
