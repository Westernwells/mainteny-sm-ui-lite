import {GridColDef, GridRowsProp} from '@mui/x-data-grid';
import {formatCurrency, formatToDp} from 'utils/currency';
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
  articles.map((item, index) => {
    const unitPrice = item
      ? Number(
          formatToDp(
            item.unitAmount.netAmount,
            item.unitAmount.fractionDigits!,
          ),
        )
      : 0;

    return {
      id: index,
      po: index + 1,
      number: item.article.externalId,
      name: item.name,
      unit: item.article.unit,
      total: unitPrice * item.quantity,
      model: item.article.model,
      supplier: item.article.manufacturer,
      unitPrice: `${formatCurrency(unitPrice, {
        currency: item.unitAmount.currency,
      })}`,
      quantity: item.quantity,
      actions: item,
      navigateTo: `details/${item.id}`,
    };
  });
