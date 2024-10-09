import {TableHead} from '@mui/material';
import {TableColumn} from 'models/table';
import {HeaderSortingState} from 'models/pagination';
import TableHeaderCell from '../TableHeaderCell';

type Props = {
  columns: TableColumn[];
  sortState?: HeaderSortingState;
  onSort?: (column: string) => void;
};

const TableHeader = ({columns, sortState, onSort}: Props) => (
  <TableHead
    sx={{
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      top: 0,
      zIndex: 3,
      minHeight: '40px',
    }}>
    {columns.map((column) => {
      if (column.hide) return;
      return (
        <TableHeaderCell
          key={column.headerName}
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
  </TableHead>
);

export default TableHeader;
