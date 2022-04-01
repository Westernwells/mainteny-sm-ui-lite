import {
  GridAlignment,
  GridColDef,
  GridColumnHeaderParams,
  GridRenderCellParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import Typography from '@mui/material/Typography';
import {formatCurrency} from 'utils/currency';
import {formatDate} from 'utils/datetime';
import {ContractView} from 'models/contract';

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
  headerAlign: 'center',
  align: 'center',
};

export const columns: GridColDef[] = [
  {
    field: 'contractNumber',
    headerName: 'CONTRACT ID',
    type: 'string',
    flex: 1,
    headerAlign: 'left',
    ...defaultProps,
  },

  {
    field: 'cost',
    headerName: 'COST/YEAR',
    type: 'number',
    ...defaultAlignment,
    ...defaultProps,
  },

  {
    field: 'expiryDate',
    headerName: 'EXPIRY DATE',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
  },
];

export const makeRows = (contracts: any): GridRowsProp =>
  contracts
    ? contracts.data.map((item: ContractView, index: number) => ({
        id: index,
        contractNumber: item.number,
        cost: `${formatCurrency(item ? item.price! : 0, {
          currency: item.currency,
        })}`,
        expiryDate: formatDate(item.endTime),
        navigateTo: item.id,
      }))
    : console.error('No Data');
