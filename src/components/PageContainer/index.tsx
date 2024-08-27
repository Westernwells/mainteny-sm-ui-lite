import {PropsWithChildren} from 'react';
import {Box} from '@mui/system';

type Props = {
  gap?: string | number;
};

const PageContainer = ({gap, children}: PropsWithChildren<Props>) => (
  <Box
    sx={{
      marginTop: '1.1em',
      padding: '2.2em',
      backgroundColor: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
    }}
    date-testid="page-content-root-container"
    gap={gap}>
    {children}
  </Box>
);

export default PageContainer;
