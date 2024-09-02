import {PropsWithChildren} from 'react';
import {Box} from '@mui/system';

type Props = {
  gap?: string | number;
};

const PageContainer = ({gap, children}: PropsWithChildren<Props>) => (
  <Box data-testId="relative" sx={{position: 'relative', flex: '1 1'}}>
    <Box
      sx={{
        marginTop: '1.1em',
        padding: '2.2em',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        position: 'absolute',
        bottom: 0,
        top: 0,
        left: 0,
        right: 0,
      }}
      date-testid="page-content-root-container"
      gap={gap}>
      {children}
    </Box>
  </Box>
);

export default PageContainer;
