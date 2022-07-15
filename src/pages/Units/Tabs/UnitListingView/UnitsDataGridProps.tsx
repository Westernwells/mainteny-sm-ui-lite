import {GridColDef, GridRenderCellParams, GridRowsProp} from '@mui/x-data-grid';
import useTheme from '@mui/material/styles/useTheme';
import Typography from '@mui/material/Typography';
import ElevatorIcon from '@mui/icons-material/Elevator';
import {getColumnProps} from 'components/DataGridLayout';
import {FormatDate} from 'models/misc';
import {StatusChip} from 'components/StatusChip';
import {ElevatorView} from '../../../../models/elevator';

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
    flex: 1.5,
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
      <StatusChip
        label={params.value ? 'YES' : 'NO'}
        color={params.value ? 'success' : 'info'}
        variant="filled"
        size="small"
        maxChars={3}
      />
    ),
  }),
];

export const makeRows = (
  elevators: ElevatorView[],
  formatDate: FormatDate = () => '',
): GridRowsProp =>
  elevators.map((elevator: ElevatorView) => ({
    id: elevator.id,
    number: elevator.externalId,
    model: elevator.model,
    customer: elevator.propertyOwner.name,
    LAST_VISIT_DATE: formatDate(elevator.lastVisitDate),
    NEXT_VISIT_DATE: formatDate(elevator.nextVisitDate),
    address: elevator.address.fullName,
    headerText: elevator.address.fullName,
    priorityTechnician: elevator.assignments.length
      ? elevator.assignments
          .map(
            (item) =>
              `${item.technician.userAccount.firstName} ${item.technician.userAccount.lastName}`,
          )
          .join(', ')
      : '-',
    activeContracts: !!elevator.contracts.length,
    elevator,
    navigateTo: `details/${elevator.id}`,
  }));
