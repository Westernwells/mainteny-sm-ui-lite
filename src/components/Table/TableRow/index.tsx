import {PropsWithChildren} from 'react';
import {TableRow as MuiTableRow, TableRowProps} from '@mui/material';

interface Props extends TableRowProps {
  testId: string;
  rowIndex?: number;
}

const TableRow = ({
  children,
  testId,
  rowIndex,
  ...props
}: PropsWithChildren<Props>) => (
  <MuiTableRow
    data-rowindex={rowIndex}
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
