import {PropsWithChildren} from 'react';
import {Box} from '@mui/system';
import {Table} from '@mui/material';

const TableContainer = ({children}: PropsWithChildren<unknown>) => (
  <Box
    sx={{
      overflow: 'auto',
      height: 'fill-available',
    }}
    date-testid="table-scroll-div-container">
    <Table stickyHeader date-testid="table-container">
      {children}
    </Table>
  </Box>
);

export default TableContainer;
