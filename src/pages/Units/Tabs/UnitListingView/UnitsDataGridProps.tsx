import {GridColDef, GridRenderCellParams, GridRowsProp} from '@mui/x-data-grid';
import useTheme from '@mui/material/styles/useTheme';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ElevatorIcon from '@mui/icons-material/Elevator';
import {getColumnProps} from 'components/DataGridLayout';
import {FormatDate} from 'models/misc';
import {StatusChip} from 'components/StatusChip';
import {
  ElevatorAssignmentSimpleView,
  ElevatorView,
} from '../../../../models/elevator';
import {Actions} from './Action';
import {ContractStatus} from '../../../../models/contract';

export const columns: GridColDef[] = [
  getColumnProps({
    field: 'number',
    headerName: 'number',
    align: 'left',
    renderCell: (params: GridRenderCellParams<any, any, any>) => {
      const theme = useTheme();
      return (
        <>
          <ElevatorIcon
            style={{marginInline: '.25em', color: theme.palette.action.active}}
          />
          <Typography
            variant="body2"
            sx={{
              whiteSpace: 'pre-wrap',
              overflowWrap: 'anywhere',
            }}>
            {params.value || '-'}
          </Typography>
        </>
      );
    },
    flex: 0.75,
  }),
  getColumnProps({
    field: 'model',
    headerName: 'model',
    cellClassName: 'truncateText',
    flex: 1,
  }),
  getColumnProps({
    field: 'building',
    headerName: 'building',
    cellClassName: 'truncateText',
    flex: 1,
  }),
  getColumnProps({
    field: 'customer',
    headerName: 'customer',
    cellClassName: 'truncateText',
    flex: 1,
  }),
  getColumnProps({
    field: 'address',
    headerName: 'address',
    cellClassName: 'truncateText',
    flex: 1.5,
  }),
  getColumnProps({
    field: 'LAST_VISIT_DATE',
    headerName: 'last visit',
    align: 'center',
    flex: 0,
    sortable: true,
  }),
  getColumnProps({
    field: 'NEXT_VISIT_DATE',
    headerName: 'next visit',
    flex: 0,
    sortable: true,
  }),
  getColumnProps({
    field: 'priorityTechnician',
    headerName: 'priority technician',
    cellClassName: 'truncateText',
  }),
  getColumnProps({
    field: 'activeContracts',
    headerName: 'active contracts',
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => (
      <Box display="flex" alignItems="center" justifyContent="center" gap={3}>
        <StatusChip
          label={params.row.activeContracts ? 'Yes' : 'No'}
          color={params.row.activeContracts ? 'success' : 'info'}
          variant="filled"
          size="small"
          maxChars={3}
        />
        <Actions id={params.row.id} />
      </Box>
    ),
  }),
];

const getPriorityTechnician = (assignments: ElevatorAssignmentSimpleView[]) => {
  let {weight} = assignments[0];
  const tech: ElevatorAssignmentSimpleView[] = [];

  assignments.forEach((i) => {
    if (i.weight === weight) {
      tech.push(i);
    } else if (i.weight > weight) {
      weight = i.weight;
      tech.splice(0, tech.length);
      tech.push(i);
    }
  });

  return tech
    .map(
      (item) =>
        `${item.technician.userAccount.firstName} ${item.technician.userAccount.lastName}`,
    )
    .join(', ');
};

export const makeRows = (
  elevators: ElevatorView[],
  formatDate: FormatDate = () => '',
): GridRowsProp =>
  elevators.map((elevator: ElevatorView) => ({
    id: elevator.id,
    number: elevator.externalId,
    model: elevator.model,
    building: elevator.additionalInfo.buildingLocation,
    actions: elevator.id,
    customer: elevator.propertyOwner.name,
    LAST_VISIT_DATE: formatDate(elevator.lastVisitDate),
    NEXT_VISIT_DATE: formatDate(elevator.nextVisitDate),
    address: elevator.address.fullName,
    headerText: elevator.address.fullName,
    priorityTechnician: elevator.assignments.length
      ? getPriorityTechnician(elevator.assignments)
      : '-',
    activeContracts:
      !!elevator.contracts.length &&
      elevator.contracts.some((it) => it.status === ContractStatus.VALID),
    elevator,
    navigateTo: `details/${elevator.id}`,
  }));
