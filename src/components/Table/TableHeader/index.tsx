import {Box} from '@mui/system';
import {TableColumn} from '../../../models/table';
import TableHeaderCell from '../TableHeaderCell';
import {HeaderSortingState, Order} from '../../../models/pagination';

type Props = {
  columns: TableColumn[];
  sortState?: HeaderSortingState;
  onSort?: (column: string) => void;
};

const TableHeader = ({columns, sortState, onSort}: Props) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      position: 'sticky', // is needed if used without a table body wrapper
      backgroundColor: '#FFFFFF',
      top: 0,
      zIndex: 3,
    }}>
    {columns.map((column) => {
      if (column.hide) return;
      return (
        <TableHeaderCell
          column={column}
          isSortStateToggled={
            column.fieldName === sortState?.columnName &&
            sortState?.order === Order.DESC
          }
          onSort={
            onSort && column.fieldName
              ? () => onSort(column.fieldName as string)
              : undefined
          }
        />
      );
    })}
  </Box>
);

export default TableHeader;
