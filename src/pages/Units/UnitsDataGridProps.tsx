import {
  GridAlignment,
  GridColDef,
  GridColumnHeaderParams,
  GridRenderCellParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import Typography from '@mui/material/Typography';
import Elevator from '@mui/icons-material/Elevator';
import {ElevatorStatus} from 'models/elevator';
import Chip from '@mui/material/Chip';
import {formatDate} from 'utils/datetime';
import {convertToText} from 'utils/utils';
import {DataGridElevatorView} from './Models';

const defaultProps = {
  editable: false,
  sortable: false,
  renderHeader: (params: GridColumnHeaderParams) => (
    <Typography variant="tableHeaderText" color="textSecondary">
      {params.colDef.headerName}
    </Typography>
  ),
  renderCell: (params: GridRenderCellParams<any, any, any>) => (
    <Typography variant="body2">{params.value || '-'}</Typography>
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

function getElevatorStatusChipColor(status: ElevatorStatus) {
  switch (status) {
    case ElevatorStatus.RUNNING:
      return 'success';
    case ElevatorStatus.BROKEN:
      return 'error';
    case ElevatorStatus.STOPPED:
      return 'warning';
    default:
      return 'default';
  }
}

export const columns: GridColDef[] = [
  {
    field: 'unitName',
    headerName: 'MODEL',
    type: 'string',
    flex: 2,
    headerAlign: 'left',
    editable: false,
    sortable: false,
    renderHeader: (params: GridColumnHeaderParams) => (
      <Typography variant="tableHeaderText" color="textSecondary">
        {params.colDef.headerName}
      </Typography>
    ),
    renderCell: (params: GridRenderCellParams<any, any, any>) => (
      <>
        <Elevator style={{marginInline: '.25em'}} />
        <Typography variant="body2">{params.value || '-'}</Typography>
      </>
    ),
  },
  {
    field: 'number',
    headerName: 'NUMBER',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'customer',
    headerName: 'CUSTOMER',
    type: 'number',
    flex: 3,
    headerAlign: 'left',
    align: 'left',
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
    field: 'nextVisit',
    headerName: 'NEXT VISIT',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'address',
    headerName: 'ADDRESS',
    type: 'number',
    flex: 3,
    headerAlign: 'left',
    align: 'left',
    ...defaultProps,
  },
  {
    field: 'status',
    headerName: 'STATUS',
    type: 'string',
    ...defaultAlignment,
    editable: false,
    sortable: false,
    disableColumnMenu: true,
    renderHeader: (params: GridColumnHeaderParams) => (
      <Typography variant="tableHeaderText" color="textSecondary">
        {params.colDef.headerName}
      </Typography>
    ),
    renderCell: (params: GridRenderCellParams<any, any, any>) => (
      <Chip
        variant="outlined"
        label={convertToText(params.value)}
        color={getElevatorStatusChipColor(params.value)}
      />
    ),
  },
];

export const makeRows = ({
  elevators,
}: {
  elevators: DataGridElevatorView[];
}): GridRowsProp => {
  const result =
    elevators.length &&
    elevators.map((elevator: DataGridElevatorView, index: number) => ({
      id: index,
      number: elevator.number,
      unitName: elevator.model,
      customer: elevator.propertyOwner.name,
      lastVisit: formatDate(elevator.lastVisitDate),
      nextVisit: formatDate(elevator.nextVisitDate),
      address: elevator.address.fullName,
      status: elevator.status,
      headerText: elevator.address.fullName,
      elevator,
      navigateTo: `details/${elevator.id}`,
    }));
  return result || [];
};
