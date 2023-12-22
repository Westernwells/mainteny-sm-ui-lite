import {GridColDef, GridRowsProp} from '@mui/x-data-grid';
import {formatCurrency} from 'utils/currency';
import {ServiceOrderArticleView} from 'models/service-order';
import {getColumnProps} from 'components/DataGridLayout';
import Box from '@mui/material/Box';
import {Actions} from './Actions';

export enum ActionTypes {
  EDIT = 'EDIT',
  DELETE = 'DELETE',
}

export const columns: GridColDef[] = [
  getColumnProps({
    field: 'no',
    headerName: 'No.',
    flex: 0.3,
    variant: 'titleCase',
  }),
  getColumnProps({
    field: 'name',
    headerName: 'NAME',
    cellClassName: 'truncateText',
    flex: 2,
    variant: 'titleCase',
  }),
  getColumnProps({
    field: 'number',
    headerName: 'NUMBER',
    flex: 1,
    align: 'right',
    headerAlign: 'right',
    variant: 'titleCase',
  }),
  getColumnProps({
    field: 'unitPrice',
    headerName: 'UNIT PRICE',
    align: 'right',
    flex: 2,
    headerAlign: 'right',
    variant: 'titleCase',
  }),
  getColumnProps({
    field: 'quantity',
    headerName: 'QUANTITY',
    align: 'center',
    headerAlign: 'center',
    variant: 'titleCase',
    flex: 1.5,
  }),
  getColumnProps({
    field: 'unit',
    headerName: 'UNIT',
    align: 'right',
    headerAlign: 'right',
    variant: 'titleCase',
    flex: 1,
  }),
  // getColumnProps({
  //   field: 'percent',
  //   headerName: '%',
  //   align: 'center',
  //   variant: 'titleCase',
  //   flex: 1.5,
  // }),
  getColumnProps({
    field: 'total',
    headerName: 'Total',
    headerAlign: 'right',
    align: 'right',
    variant: 'titleCase',
    flex: 1,
  }),
  getColumnProps({
    field: 'actions',
    headerName: 'actions',
    headerAlign: 'right',
    align: 'right',
    variant: 'titleCase',
    flex: 1.5,
    renderCell(params) {
      return (
        <Box>
          <Actions
            article={params.value.article}
            serviceOrderId={params.value.serviceOrderId}
            serviceOrderArticleId={params.value.id}
          />
        </Box>
      );
    },
  }),
];

export const makeRows = (articles: ServiceOrderArticleView[]): GridRowsProp =>
  articles?.map((item, index) => ({
    id: index,
    no: index + 1,
    number: item.article.externalId,
    name: item.name,
    unit: item.article.unit,
    total: formatCurrency(
      (item.unitAmount.netAmount * item.quantity) /
        10 ** item.unitAmount.fractionDigits!,
      {currency: item.unitAmount.currency},
    ),
    unitPrice: formatCurrency(
      item.unitAmount.netAmount / 10 ** item.unitAmount.fractionDigits!,
      {currency: item.unitAmount.currency},
    ),
    quantity: item.quantity,
    // percent: '-',
    actions: item,
    navigateTo: `/articles/details/${item.article.id}`,
  }));
