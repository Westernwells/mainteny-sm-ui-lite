import {GridColDef, GridRenderCellParams, GridRowsProp} from '@mui/x-data-grid';
import Typography from '@mui/material/Typography';
import {Elevator} from '@mui/icons-material';
import useTheme from '@mui/material/styles/useTheme';
import {getColumnProps} from 'components/DataGridLayout';
import {DataGridElevatorView} from 'pages/Units/Models';
import {FormatDate} from 'models/misc';
import {ElevatorOrderField} from 'models/elevator';

export const columns: GridColDef[] = [
  getColumnProps({
    field: ElevatorOrderField.EXTERNAL_ID,
    sortable: true,
    headerName: 'unit number',
    align: 'left',
    flex: 1.25,
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
    field: ElevatorOrderField.MODEL,
    sortable: true,
    headerName: 'model',
    align: 'left',
    flex: 2,
  }),
  getColumnProps({
    field: ElevatorOrderField.PROPERTY_OWNER_NAME,
    sortable: true,
    headerName: 'customer',
    cellClassName: 'truncateText',
    align: 'left',
    flex: 2,
  }),
  getColumnProps({
    field: ElevatorOrderField.ADDRESS,
    sortable: true,
    headerName: 'address',
    cellClassName: 'truncateText',
    align: 'left',
    flex: 4,
  }),
  getColumnProps({
    field: ElevatorOrderField.LAST_VISIT_DATE,
    headerName: 'last visit',
    align: 'left',
    flex: 2,
    sortable: true,
  }),
];

export const makeRows = (
  {
    elevators,
  }: {
    elevators: DataGridElevatorView[];
  },
  formatDate: FormatDate = () => '',
): GridRowsProp => {
  const result =
    elevators.length &&
    elevators.map((elevator: DataGridElevatorView) => ({
      id: elevator.id,
      [ElevatorOrderField.EXTERNAL_ID]: elevator.externalId || '-',
      [ElevatorOrderField.ADDRESS]: elevator?.address?.fullName || '-',
      [ElevatorOrderField.MODEL]: elevator.model || '-',
      [ElevatorOrderField.PROPERTY_OWNER_NAME]:
        elevator.propertyOwner.name || '-',
      [ElevatorOrderField.LAST_VISIT_DATE]: formatDate(elevator.lastVisitDate),
    }));
  return result || [];
};
