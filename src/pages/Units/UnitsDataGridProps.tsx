import {
  GridAlignment,
  GridColDef,
  GridColumnHeaderParams,
  GridRenderCellParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import Typography from '@mui/material/Typography';
import Elevator from '@mui/icons-material/Elevator';
import {formatDate} from 'utils/datetime';
import {DataGridElevatorView} from './Models';

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
      {params.value || '-'}
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
    field: 'model',
    headerName: 'MODEL',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
    flex: 2,
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
    field: 'address',
    headerName: 'ADDRESS',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
    flex: 4,
  },
  {
    field: 'customer',
    headerName: 'CUSTOMER',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
    flex: 3,
  },
  {
    field: 'address',
    headerName: 'ADDRESS',
    type: 'string',
    ...defaultProps,
    ...defaultAlignment,
    flex: 3,
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
    field: 'priorityTechnician',
    headerName: 'PRIORITY TECHNICIAN',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
    flex: 2,
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
      model: elevator.model,
      customer: elevator.propertyOwner.name,
      lastVisit: formatDate(elevator.lastVisitDate),
      nextVisit: formatDate(elevator.nextVisitDate),
      address: elevator.address.fullName,
      headerText: elevator.address.fullName,
      priorityTechnician: `${elevator.assignments[0].technician.userAccount.firstName} ${elevator.assignments[0].technician.userAccount.lastName}`,
      elevator,
      navigateTo: `details/${elevator.id}`,
    }));
  return result || [];
};
