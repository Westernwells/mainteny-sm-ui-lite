import {PropsWithChildren} from 'react';
import {Box, BoxProps} from '@mui/material';

interface Props extends BoxProps {
  testId: string;
}

const TableRow = ({children, testId, ...props}: PropsWithChildren<Props>) => (
  <Box
    role="row"
    data-testid={testId}
    sx={{
      display: 'flex',
      alignItems: 'center',
      height: '44px',
      cursor: 'pointer',
      '&:hover': {
        bgcolor: '#F7F9FC',
      },
    }}
    {...props}>
    {children}
  </Box>
);

export default TableRow;
