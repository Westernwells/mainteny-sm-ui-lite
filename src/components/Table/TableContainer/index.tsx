import {PropsWithChildren} from 'react';
import {Box} from '@mui/system';

const TableContainer = ({children}: PropsWithChildren<unknown>) => (
  <Box
    date-testid="table-container"
    sx={{display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
    {children}
  </Box>
);

export default TableContainer;
