import {
  GridAlignment,
  GridColDef,
  GridColumnHeaderParams,
  GridRenderCellParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import Typography from '@mui/material/Typography';
// import Box from '@mui/material/Box';
import {formatCurrency} from 'utils/currency';
import {ArticleView} from 'models/article';

const defaultProps = {
  editable: false,
  renderHeader: (params: GridColumnHeaderParams) => (
    <Typography variant="subtitle2" color="textSecondary">
      {params.colDef.headerName}
    </Typography>
  ),
  renderCell: (params: GridRenderCellParams<any, any, any>) => (
    <Typography variant="body2" mx="0.5em">
      {params.value || '-'}
    </Typography>
  ),
};
const defaultAlignment: {
  flex: number;
  headerAlign: GridAlignment;
  align: GridAlignment;
} = {
  flex: 1,
  headerAlign: 'left',
  align: 'left',
};

export const columns: GridColDef[] = [
  {
    field: 'po',
    headerName: 'PO',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'name',
    headerName: 'NAME',
    type: 'string',
    cellClassName: 'truncateText',
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'number',
    headerName: 'NUMBER',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'unitPrice',
    headerName: 'UN IT PRICE',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'quantity',
    headerName: 'QUANTITY',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
  },

  {
    field: 'unit',
    headerName: 'UNIT',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'total',
    headerName: 'Total',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'action',
    headerName: 'ACTION',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
  },
];

export const makeRows = (articles: ArticleView[]): GridRowsProp =>
  articles.map((item, index) => {
    const unitPrice = item
      ? item.unitSellingAmount.netAmount /
        10 ** item.unitSellingAmount.fractionDigits!
      : 0;

    return {
      id: index,
      po: index + 1,
      number: item.number,
      name: item.name,
      unit: item.unit,
      total: unitPrice * item.stock.currentStock,
      model: item.model,
      supplier: item.supplier,
      unitPrice: `${formatCurrency(unitPrice, {
        currency: item.unitSellingAmount.currency,
      })}`,
      quantity: item.stock.currentStock,
      navigateTo: `details/${item.id}`,
      item,
    };
  });
