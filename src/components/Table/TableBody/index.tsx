import {PropsWithChildren} from 'react';
import {Box} from '@mui/system';

const TableBody = ({children}: PropsWithChildren<unknown>) => (
  <Box
    date-testid="table-body-container"
    sx={{
      overflow: 'auto',
    }}>
    {children}
  </Box>
);

export default TableBody;
