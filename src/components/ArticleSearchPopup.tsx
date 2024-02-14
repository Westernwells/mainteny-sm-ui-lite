import {
  TableContainer,
  Paper,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';

const ArticleSearchPopup = ({
  searchResults,
  onSelect,
}: {
  searchResults: any;
  onSelect: any;
}) => (
  <TableContainer component={Paper}>
    <Table>
      <TableBody>
        {searchResults.map((item: any) => (
          <TableRow key={item.id} onClick={() => onSelect(item)}>
            <TableCell>{item.name}</TableCell>
            <TableCell>{item.number}</TableCell>
            <TableCell>{item.category}</TableCell>
            <TableCell>{item.unitSellingAmount.value}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

export default ArticleSearchPopup;
