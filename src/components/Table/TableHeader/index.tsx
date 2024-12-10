import {TableHead, TableRow} from '@mui/material';
import {TableColumn} from 'models/table';
import {HeaderSortingState} from 'models/pagination';
import TableHeaderCell from '../TableHeaderCell';

type Props = {
  columns: TableColumn[];
  sortState?: HeaderSortingState;
  onSort?: (column: string) => void;
  capitalize?: boolean;
};

const TableHeader = ({columns, sortState, onSort, capitalize}: Props) => (
  <TableHead
    sx={{
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      zIndex: 5,
      height: '40px',
      ...(capitalize && {textTransform: 'capitalize'}),
    }}>
    <TableRow>
      {columns.map((column) => {
        if (column.hide) return;
        return (
          <TableHeaderCell
            key={column.headerName}
            isFirst={column.isFirst}
            isLast={column.isLast}
            column={column}
            sortState={sortState}
            onSort={
              onSort && column.fieldName
                ? () => onSort(column.fieldName as string)
                : undefined
            }
          />
        );
      })}
    </TableRow>
  </TableHead>
);

export default TableHeader;
