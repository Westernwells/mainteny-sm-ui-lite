import {GridColDef, GridRenderCellParams, GridRowsProp} from '@mui/x-data-grid';
import {getColumnProps} from 'components/DataGridLayout';
import {ElevatorOrderField} from 'models/elevator';
import {FormatDate} from 'models/misc';
import {StatusChip} from 'components/StatusChip';
import {ContractElevatorView} from 'models/contract';
import {getFrequency} from 'utils/elevator-utils';
import {NavigateToUnit} from './NavigateToDetails';
import {Actions} from './Actions';

export const getAutoJobStatus = (
  elevator: ContractElevatorView,
): {
  label: string;
  color: 'default' | 'darkSuccess';
} => {
  const {contracts} = elevator;
  const autoJob = contracts?.find((c) =>
    c?.components?.find((com) => com.additionalInfo.firstOrderDate !== ''),
  );

  if (autoJob) {
    return {label: 'Yes', color: 'darkSuccess'};
  }
  return {label: 'No', color: 'default'};
};

export const columns: GridColDef[] = [
  getColumnProps({
    field: ElevatorOrderField.EXTERNAL_ID,
    headerName: 'serial number',
    align: 'left',
    flex: 1,
    sortable: true,
    renderCell: (params) => <NavigateToUnit unit={params.row.elevator} />,
  }),
  getColumnProps({
    field: ElevatorOrderField.BUILDING_LOCATION,
    headerName: 'building',
    align: 'left',
    sortable: true,
    flex: 1,
  }),
  getColumnProps({
    field: ElevatorOrderField.ADDRESS,
    headerName: 'address',
    cellClassName: 'truncateText',
    sortable: true,
    flex: 2,
  }),
  getColumnProps({
    field: 'auto-job',
    headerName: 'auto-job',
    align: 'center',
    renderCell: (params: GridRenderCellParams<any, any, any>) => (
      <StatusChip
        label={getAutoJobStatus(params.row?.elevator).label}
        color={getAutoJobStatus(params.row?.elevator).color}
        maxChars={8}
        variant="outlined"
      />
    ),
    flex: 0.75,
  }),
  getColumnProps({
    field: 'auto-job',
    headerName: 'auto-job',
    align: 'center',
    renderCell: (params: GridRenderCellParams<any, any, any>) => (
      <StatusChip
        label={getAutoJobStatus(params.row?.elevator).label}
        color={getAutoJobStatus(params.row?.elevator).color}
        maxChars={8}
        variant="outlined"
      />
    ),
    flex: 0.75,
  }),
  getColumnProps({
    field: 'frequency',
    headerName: 'Frequency',
    align: 'left',
    headerAlign: 'left',
    renderCell: (params) => getFrequency(params.row?.elevator),
  }),
  getColumnProps({
    field: 'actions',
    headerName: '',
    align: 'right',
    headerAlign: 'right',
    renderCell: (params) => <Actions id={params?.row?.id} />,
  }),
];

export const makeRows = (
  {
    elevators,
  }: {
    elevators: ContractElevatorView[];
  },
  formatDate: FormatDate = () => '',
): GridRowsProp => {
  const result =
    elevators.length &&
    elevators.map((elevator: ContractElevatorView) => ({
      id: elevator.id,
      [ElevatorOrderField.EXTERNAL_ID]: elevator.externalId,
      [ElevatorOrderField.BUILDING_LOCATION]:
        elevator.additionalInfo.buildingLocation,
      customer: elevator.propertyOwner.name,
      lastVisit: formatDate(elevator.lastVisitDate),
      nextVisit: formatDate(elevator.nextVisitDate),
      [ElevatorOrderField.ADDRESS]: elevator.address.fullName,
      headerText: elevator.address.fullName,
      elevator,
    }));
  return result || [];
};
