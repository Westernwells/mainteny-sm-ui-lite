import {GridColDef, GridRenderCellParams, GridRowsProp} from '@mui/x-data-grid';
import useTheme from '@mui/material/styles/useTheme';
import Typography from '@mui/material/Typography';
import ElevatorIcon from '@mui/icons-material/Elevator';
import {getColumnProps} from 'components/DataGridLayout';
import {FormatDate} from 'models/misc';
import {StatusChip} from 'components/StatusChip';
import {toDate} from 'utils/datetime';
import {
  ElevatorAssignmentSimpleView,
  ElevatorOrderField,
  ElevatorView,
} from 'models/elevator';
import {ContractStatus} from 'models/contract';
import {Actions} from './Action';

export const columns: GridColDef[] = [
  getColumnProps({
    field: ElevatorOrderField.EXTERNAL_ID,
    sortable: true,
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
    flex: 1,
  }),
  getColumnProps({
    field: ElevatorOrderField.MODEL,
    sortable: true,
    headerName: 'model',
    cellClassName: 'truncateText',
    flex: 1,
  }),
  getColumnProps({
    field: ElevatorOrderField.BUILDING_LOCATION,
    sortable: true,
    headerName: 'building',
    cellClassName: 'truncateText',
    flex: 1,
  }),
  getColumnProps({
    field: ElevatorOrderField.PROPERTY_OWNER_NAME,
    sortable: true,
    headerName: 'customer',
    cellClassName: 'truncateText',
    flex: 1,
  }),
  getColumnProps({
    field: ElevatorOrderField.ADDRESS,
    sortable: true,
    headerName: 'address',
    cellClassName: 'truncateText',
    flex: 1.5,
  }),
  getColumnProps({
    field: ElevatorOrderField.LAST_INSPECTION_DATE,
    headerName: 'last mainten.',
    align: 'center',
    flex: 0.75,
  }),
  getColumnProps({
    field: ElevatorOrderField.NEXT_INSPECTION_DATE,
    headerName: 'next inspect.',
    flex: 0.75,
  }),
  getColumnProps({
    field: ElevatorOrderField.ASSIGNED_TECHNICIAN_NAMES,
    sortable: true,
    headerName: 'engineer',
    cellClassName: 'truncateText',
  }),
  getColumnProps({
    field: ElevatorOrderField.NUMBER_OF_CONTRACTS,
    sortable: true,
    headerName: 'active con.',
    align: 'center',
    headerAlign: 'center',
    flex: 0.5,
    renderCell: (params) => (
      <StatusChip
        label={
          params.row?.[ElevatorOrderField.NUMBER_OF_CONTRACTS] ? 'Yes' : 'No'
        }
        color={
          params.row?.[ElevatorOrderField.NUMBER_OF_CONTRACTS]
            ? 'darkSuccess'
            : 'error'
        }
        variant="filled"
        size="small"
        maxChars={3}
        style={{flex: '0 0 50%'}}
      />
    ),
  }),
  getColumnProps({
    field: 'actions',
    headerName: '',
    align: 'center',
    flex: 0.1,
    renderCell: (params) => <Actions id={params.row.id} />,
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
    [ElevatorOrderField.EXTERNAL_ID]: elevator.externalId,
    [ElevatorOrderField.MODEL]: elevator.model,
    [ElevatorOrderField.BUILDING_LOCATION]:
      elevator.additionalInfo.buildingLocation,
    actions: elevator.id,
    [ElevatorOrderField.PROPERTY_OWNER_NAME]:
      elevator.propertyOwner.meta?.state === 'ACTIVE'
        ? elevator.propertyOwner.name
        : '-',
    [ElevatorOrderField.LAST_INSPECTION_DATE]: elevator.additionalInfo
      .lastInspectionDate
      ? formatDate(toDate(elevator.additionalInfo.lastInspectionDate))
      : '-',
    [ElevatorOrderField.NEXT_INSPECTION_DATE]: elevator.additionalInfo
      .nextInspectionDate
      ? formatDate(toDate(elevator.additionalInfo.nextInspectionDate))
      : '-',
    [ElevatorOrderField.ADDRESS]: elevator.address.fullName,
    headerText: elevator.address.fullName,
    [ElevatorOrderField.ASSIGNED_TECHNICIAN_NAMES]: elevator.assignments.length
      ? getPriorityTechnician(elevator.assignments)
      : '-',
    [ElevatorOrderField.NUMBER_OF_CONTRACTS]:
      !!elevator.contracts.length &&
      elevator.contracts.some(
        (it) =>
          it.status === ContractStatus.VALID ||
          it.status === ContractStatus.EXPIRING,
      ),
    elevator,
    navigateTo: `details/${elevator.id}`,
  }));
