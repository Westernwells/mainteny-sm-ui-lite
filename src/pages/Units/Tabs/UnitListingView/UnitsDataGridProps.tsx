import {GridColDef, GridRenderCellParams, GridRowsProp} from '@mui/x-data-grid';
import Typography from '@mui/material/Typography';
import ElevatorIcon from '@mui/icons-material/Elevator';
import {getColumnProps} from 'components/DataGridLayout';
import {formatDate} from 'utils/datetime';
import {StatusChip} from 'components/StatusChip';
import {DataGridElevatorView} from '../../Models';

export const columns: GridColDef[] = [
  getColumnProps({
    field: 'number',
    headerName: 'number',
    align: 'center',
    flex: 0,
  }),
  getColumnProps({
    field: 'model',
    headerName: 'model',
    renderCell: (params: GridRenderCellParams<any, any, any>) => (
      <>
        <ElevatorIcon style={{marginInline: '.25em'}} />
        <Typography variant="body2">{params.value || '-'}</Typography>
      </>
    ),
  }),
  getColumnProps({
    field: 'customer',
    headerName: 'customer',
    cellClassName: 'truncateText',
    flex: 1.5,
  }),
  getColumnProps({
    field: 'address',
    headerName: 'address',
    cellClassName: 'truncateText',
    flex: 1.5,
  }),
  getColumnProps({
    field: 'lastVisit',
    headerName: 'last visit',
    align: 'center',
    flex: 0,
  }),
  getColumnProps({
    field: 'nextVisit',
    headerName: 'next visit',
    flex: 0,
  }),
  getColumnProps({
    field: 'priorityTechnician',
    headerName: 'priority technician',
  }),
  getColumnProps({
    field: 'activeContracts',
    headerName: 'active contracts',
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => (
      <StatusChip
        label={params.value ? 'Yes' : 'No'}
        color={params.value ? 'success' : 'error'}
        variant="filled"
        size="small"
        maxChars={3}
      />
    ),
  }),
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
      priorityTechnician: elevator.assignments.length
        ? `${elevator.assignments[0].technician.userAccount.firstName} ${elevator.assignments[0].technician.userAccount.lastName}`
        : '-',
      // TODO: Use API data
      activeContracts: !!elevator.contracts.length,
      elevator,
      navigateTo: `details/${elevator.id}`,
    }));
  return result || [];
};
