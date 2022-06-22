import {GridColDef, GridRowsProp} from '@mui/x-data-grid';
import {formatCurrency} from 'utils/currency';
import {ServiceOrderArticleView} from 'models/service-order';
import {getColumnProps} from 'components/DataGridLayout';
import Box from '@mui/material/Box';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';

export const columns = (): GridColDef[] => [
  getColumnProps({
    field: 'po',
    headerName: 'PO',
  }),
  getColumnProps({
    field: 'name',
    headerName: 'NAME',
    cellClassName: 'truncateText',
  }),
  getColumnProps({
    field: 'number',
    headerName: 'NUMBER',
  }),
  getColumnProps({
    field: 'unitPrice',
    headerName: 'UNIT PRICE',
  }),
  getColumnProps({
    field: 'quantity',
    headerName: 'QUANTITY',
  }),
  getColumnProps({
    field: 'unit',
    headerName: 'UNIT',
  }),

  getColumnProps({
    field: 'total',
    headerName: 'Total',
  }),
  getColumnProps({
    field: 'actions',
    headerName: 'ACTIONS',
    renderCell(params) {
      return (
        <Box>
          <IconButton onClick={() => console.log(params.value)}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => console.log(params.value)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      );
    },
  }),
];

export const makeRows = (articles: ServiceOrderArticleView[]): GridRowsProp =>
  articles.map((item, index) => {
    const unitPrice = item
      ? item.unitAmount.netAmount / 10 ** item.unitAmount.fractionDigits!
      : 0;

    return {
      id: index,
      po: index + 1,
      number: item.article.number,
      name: item.name,
      unit: item.article.unit,
      total: unitPrice * item.article.stock.currentStock,
      model: item.article.model,
      supplier: item.article.manufacturer,
      unitPrice: `${formatCurrency(unitPrice, {
        currency: item.unitAmount.currency,
      })}`,
      quantity: item.article.stock.currentStock,
      actions: item,
      navigateTo: `details/${item.id}`,
    };
  });
