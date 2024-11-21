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
      height: '44px',
      cursor: 'pointer',

      '&:hover td': {
        background: '#F7F9FC',
      },
    }}
    {...props}>
    {children}
  </MuiTableRow>
);

export default TableRow;
