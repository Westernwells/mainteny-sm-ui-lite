import {Box} from '@mui/system';
import {TableColumn} from '../../../models/table';
import TableHeaderCell from '../TableHeaderCell';

type Props = {
  columns: TableColumn[];
  onSort?: (column: string) => void;
};

const TableHeader = ({columns, onSort}: Props) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      position: 'sticky', // is needed if used without a table body wrapper
      backgroundColor: '#FFFFFF',
      top: 0,
    }}>
    {columns.map((column) => {
      if (column.hide) return;
      return (
        <TableHeaderCell
          column={column}
          onSort={onSort ? () => onSort(column.headerName) : undefined}
        />
      );
    })}
  </Box>
);

export default TableHeader;
