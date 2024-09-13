import {PropsWithChildren} from 'react';
import {Box} from '@mui/material';

type Props = {
  testId: string;
};

const TableRow = ({children, testId}: PropsWithChildren<Props>) => (
  <Box
    data-testid={testId}
    sx={{
      display: 'flex',
      alignItems: 'center',
      minHeight: '44px',
      cursor: 'pointer',
      '&:hover': {
        bgcolor: '#F7F9FC',
      },
    }}>
    {children}
  </Box>
);

export default TableRow;
