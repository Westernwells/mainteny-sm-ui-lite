import {PropsWithChildren} from 'react';
import {TableBody as MuiTableBody} from '@mui/material';

const TableBody = ({children}: PropsWithChildren<unknown>) => (
  <MuiTableBody
    data-testid="table-body-container"
    sx={{
      overflow: 'auto',
    }}>
    {children}
  </MuiTableBody>
);

export default TableBody;
