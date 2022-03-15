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
    <Typography variant="subtitle2">{params.colDef.headerName}</Typography>
  ),
  renderCell: (params: GridRenderCellParams<any, any, any>) => (
    <Typography variant="subtitle2">{params.value}</Typography>
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
    field: 'unitNumber',
    headerName: 'UNIT NUMBER',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'address',
    headerName: 'ADDRESS',
    type: 'string',
    flex: 1.5,
    ...defaultProps,
  },
  {
    field: 'lastVisit',
    headerName: 'LAST VISIT',
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
      <Typography variant="subtitle2">{params.colDef.headerName}</Typography>
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
        unitNumber: item.number,
        address: item.address.fullName,
        lastVisit: item.lastVisitDate,

        status: item.status,

        navigateTo: `/units/${item.id}`,
      }))
    : [];
