import {PropsWithChildren} from 'react';
import {TableRow as MuiTableRow, TableRowProps} from '@mui/material';

interface Props extends TableRowProps {
  testId: string;
}

const TableRow = ({children, testId, ...props}: PropsWithChildren<Props>) => (
  <MuiTableRow
    data-testid={testId}
    role="row"
    sx={{
      alignItems: 'center',
      minHeight: '44px',
      cursor: 'pointer',
      '&:hover': {
        bgcolor: '#F7F9FC',
      },
    }}
    {...props}>
    {children}
  </MuiTableRow>
);

export default TableRow;
