import {
  GridAlignment,
  GridColDef,
  GridColumnHeaderParams,
  GridRenderCellParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import Typography from '@mui/material/Typography';
import {formatCurrency} from 'utils/currency';

const defaultProps = {
  editable: false,
  renderHeader: (params: GridColumnHeaderParams) => (
    <Typography variant="subtitle2" color="textSecondary">
      {params.colDef.headerName}
    </Typography>
  ),
  renderCell: (params: GridRenderCellParams<any, any, any>) => (
    <Typography variant="body2" mx="0.5em">
      {params.value}
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
    field: 'packageNumber',
    headerName: 'PACKAGE NUMBER',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
    flex: 1,
  },
  {
    field: 'name',
    headerName: 'NAME',
    type: 'number',
    ...defaultAlignment,
    ...defaultProps,
    flex: 3,
  },
  {
    field: 'sellingPrice',
    headerName: 'SELLING PRICE',
    type: 'number',
    ...defaultAlignment,
    ...defaultProps,
    flex: 1,
  },
];

export const makeRows = (packages: any): GridRowsProp =>
  packages
    ? packages.map((item: any, index: number) => ({
        id: index,
        name: item.name,
        sellingPrice: `${formatCurrency(item ? item.sellingPrice! : 0, {
          currency: 'EUR',
        })}`,
        packageNumber: item.packageNumber,
      }))
    : [];
