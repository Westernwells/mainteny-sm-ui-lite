import {GridColDef, GridRowsProp} from '@mui/x-data-grid';
import {multipleAmount, formatNetAmount} from 'utils/currency';
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
    align: 'right',
  }),
  getColumnProps({
    field: 'quantity',
    headerName: 'QUANTITY',
    align: 'right',
  }),
  getColumnProps({
    field: 'unit',
    headerName: 'UNIT',
  }),

  getColumnProps({
    field: 'total',
    headerName: 'Total',
    align: 'right',
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
  articles
    .sort((a, b) => a.article.name.localeCompare(b.article.name))
    .map((item, index) => ({
      id: index,
      no: index + 1,
      number: item.article.externalId,
      name: item.name,
      unit: item.article.unit,
      total: formatNetAmount(multipleAmount(item.unitAmount, item.quantity)),
      model: item.article.model,
      supplier: item.article.manufacturer,
      unitPrice: formatNetAmount(item.unitAmount),
      quantity: item.quantity,
      actions: item,
      navigateTo: `/articles/details/${item.article.id}`,
    }));
