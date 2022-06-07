import {
  GridAlignment,
  GridColDef,
  GridColumnHeaderParams,
  GridRenderCellParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import Typography from '@mui/material/Typography';
import {formatDate} from 'utils/datetime';
import {StatusChip} from 'components/StatusChip';
import {convertToText} from 'utils/utils';
import {ContractStatus, ContractView} from 'models/contract';

const defaultProps = {
  editable: false,
  sortable: false,
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
    field: 'number',
    headerName: 'NUMBER',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'contractType',
    headerName: 'CONTRACT TYPE',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'startDate',
    headerName: 'START DATE',
    type: 'number',
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'expiryDate',
    headerName: 'EXPIRY DATE',
    type: 'number',
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'status',
    headerName: 'STATUS',
    disableColumnMenu: true,
    disableExport: true,
    ...defaultAlignment,
    ...defaultProps,
    renderCell: (params) => (
      <StatusChip
        label={convertToText(params.value)}
        color={
          params.value === ContractStatus.VALID
            ? 'success'
            : params.value === ContractStatus.PENDING
            ? 'secondary'
            : 'error'
        }
        variant="filled"
        maxChars={8}
      />
    ),
  },
];

export const makeRows = (contracts: ContractView[]): GridRowsProp =>
  contracts.map((item: ContractView) => ({
    id: item.id,
    number: item.number,
    contractType: item.type,
    startDate: formatDate(new Date(item.startTime), 'dd.MM.yyy') || '-',
    expiryDate: formatDate(new Date(item.endTime), 'dd.MM.yyy') || '-',
    status: item.status,
    navigateTo: `details/${item.id}`,
  }));
