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
      zIndex: 3,
    }}>
    {columns.map((column) => {
      if (column.hide) return;
      return (
        <TableHeaderCell
          column={column}
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
