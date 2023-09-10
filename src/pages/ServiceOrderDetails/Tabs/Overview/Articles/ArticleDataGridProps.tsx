import {GridColDef, GridRowsProp} from '@mui/x-data-grid';
import {formatCurrency} from 'utils/currency';
import {ServiceOrderArticleView} from 'models/service-order';
import {getColumnProps} from 'components/DataGridLayout';
import Box from '@mui/material/Box';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';

export enum ActionTypes {
  EDIT = 'EDIT',
  DELETE = 'DELETE',
}

export const columns = (
  handleAction: (val: ServiceOrderArticleView, actionType: ActionTypes) => void,
): GridColDef[] => [
  getColumnProps({
    field: 'no',
    headerName: 'No.',
    flex: 0.3,
  }),
  getColumnProps({
    field: 'name',
    headerName: 'NAME',
    cellClassName: 'truncateText',
    flex: 2,
  }),
  getColumnProps({
    field: 'number',
    headerName: 'NUMBER',
    flex: 1,
  }),
  getColumnProps({
    field: 'unitPrice',
    headerName: 'UNIT PRICE',
    align: 'center',
    flex: 2,
  }),
  getColumnProps({
    field: 'quantity',
    headerName: 'QUANTITY',
    align: 'center',
    flex: 1,
  }),
  getColumnProps({
    field: 'unit',
    headerName: 'UNIT',
  }),

  getColumnProps({
    field: 'total',
    headerName: 'Total',
    align: 'center',
    flex: 2,
  }),
  getColumnProps({
    field: 'actions',
    headerName: 'ACTIONS',
    headerAlign: 'right',
    renderCell(params) {
      return (
        <Box>
          <IconButton
            onClick={() => handleAction(params.value, ActionTypes.EDIT)}>
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={() => handleAction(params.value, ActionTypes.DELETE)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      );
    },
  }),
];

export const makeRows = (articles: ServiceOrderArticleView[]): GridRowsProp =>
  articles.map((item, index) => ({
    id: index,
    no: index + 1,
    number: item.article.externalId,
    name: item.name,
    unit: item.article.unit,
    total: formatCurrency(
      (item.unitAmount.netAmount * item.quantity) /
        10 ** item.unitAmount.fractionDigits!,
    ),
    model: item.article.model,
    supplier: item.article.manufacturer,
    unitPrice: formatCurrency(
      item.unitAmount.netAmount / 10 ** item.unitAmount.fractionDigits!,
    ),
    quantity: item.quantity,
    actions: item,
    navigateTo: `/articles/details/${item.article.id}`,
  }));
