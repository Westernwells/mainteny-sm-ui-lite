import {GridColDef, GridRenderCellParams, GridRowsProp} from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {Elevator} from '@mui/icons-material';
import useTheme from '@mui/material/styles/useTheme';

import {StatusChip} from 'components/StatusChip';
import {FormatDate} from 'models/misc';
import {getColumnProps} from 'components/DataGridLayout';
import {ElevatorView} from 'models/elevator';
import {Actions} from './Action';
import {ContractStatus} from '../../../../models/contract';

export const columns: GridColDef[] = [
  getColumnProps({
    field: 'number',
    headerName: 'number',
    align: 'left',
    flex: 1,
    renderCell: (params: GridRenderCellParams<any, any, any>) => {
      const theme = useTheme();
      return (
        <>
          <Elevator
            style={{marginInline: '.25em', color: theme.palette.action.active}}
          />
          <Typography variant="body2">{params.value || '-'}</Typography>
        </>
      );
    },
  }),
  getColumnProps({
    field: 'model',
    headerName: 'model',
    align: 'left',
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
        <Actions elevatorId={params.row.elevator.id} />
      </Box>
    ),
  }),
];

export const makeRows = (
  {
    elevators,
  }: {
    elevators: ElevatorView[];
  },
  formatDate: FormatDate = () => '',
): GridRowsProp => {
  const result =
    elevators.length &&
    elevators.map((elevator: ElevatorView, index: number) => ({
      id: index,
      number: elevator.externalId,
      model: elevator.model,
      building: elevator.additionalInfo.buildingLocation,
      customer: elevator.propertyOwner.name,
      lastVisit: formatDate(elevator.lastVisitDate),
      nextVisit: formatDate(elevator.nextVisitDate),
      address: elevator.address.fullName,
      headerText: elevator.address.fullName,
      priorityTechnician: elevator.assignments?.length
        ? elevator.assignments
            .map(
              (item) =>
                `${item.technician.userAccount.firstName} ${item.technician.userAccount.lastName}`,
            )
            .join(', ')
        : '-',
      activeContracts:
        !!elevator.contracts?.length &&
        elevator.contracts.some((it) => it.status === ContractStatus.VALID),
      elevator,
      navigateTo: `/units/details/${elevator.id}`,
    }));
  return result || [];
};
