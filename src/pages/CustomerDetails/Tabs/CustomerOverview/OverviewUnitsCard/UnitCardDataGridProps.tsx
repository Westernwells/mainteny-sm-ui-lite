import {
  GridAlignment,
  GridColDef,
  GridColumnHeaderParams,
  GridRenderCellParams,
  GridRowModel,
} from '@mui/x-data-grid';
import Typography from '@mui/material/Typography';
import {StatusChip} from 'components/StatusChip';
import {ElevatorStatus, ElevatorView} from 'models/elevator';
import {Resource} from 'models/misc';

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
    field: 'model',
    headerName: 'MODEL',
    type: 'string',
    flex: 2,
    headerAlign: 'left',
    ...defaultProps,
  },
  {
    field: 'unitNo',
    headerName: 'UNIT NO',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'status',
    headerName: 'STATUS',
    type: 'string',
    ...defaultAlignment,
    editable: false,
    renderHeader: (params: GridColumnHeaderParams) => (
      <Typography variant="subtitle2" color="textSecondary">
        {params.colDef.headerName}
      </Typography>
    ),
    renderCell: (params: GridRenderCellParams<any, any, any>) => (
      <StatusChip
        label={params.value}
        color={params.value === ElevatorStatus.RUNNING ? 'success' : 'error'}
      />
    ),
  },
];

export const makeRows = (
  units: Resource<ElevatorView>,
): GridRowModel<{[key: string]: any}[]> =>
  units.data.length
    ? units.data.map((item: ElevatorView, index: number) => ({
        id: index,
        model: item.model,
        unitNo: item.number,
        status: item.status,
        navigateTo: `/units/${item.id}`,
      }))
    : [];
