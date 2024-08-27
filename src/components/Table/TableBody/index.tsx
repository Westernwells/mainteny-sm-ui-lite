import {PropsWithChildren} from 'react';
import {Box} from '@mui/system';

const TableBody = ({children}: PropsWithChildren<unknown>) => (
  <Box date-testid="table-container" sx={{height: '65vh', overflow: 'auto'}}>
    {children}
  </Box>
);

export default TableBody;
