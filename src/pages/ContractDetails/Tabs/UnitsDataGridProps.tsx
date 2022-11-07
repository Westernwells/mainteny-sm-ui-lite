import {GridColDef, GridRenderCellParams, GridRowsProp} from '@mui/x-data-grid';
import Typography from '@mui/material/Typography';
import {Elevator} from '@mui/icons-material';
import useTheme from '@mui/material/styles/useTheme';
import {getColumnProps} from 'components/DataGridLayout';
import {ElevatorView} from 'models/elevator';
import {FormatDate} from 'models/misc';

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
    field: 'address',
    headerName: 'address',
    cellClassName: 'truncateText',
    flex: 2,
  }),
  getColumnProps({
    field: 'lastVisit',
    headerName: 'last visit',
    align: 'center',
    flex: 0.75,
  }),
  getColumnProps({
    field: 'nextVisit',
    headerName: 'next visit',
    flex: 0.75,
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
      lastVisit: formatDate(elevator.lastVisitDate),
      nextVisit: formatDate(elevator.nextVisitDate),
      address: elevator.address.fullName,
      headerText: elevator.address.fullName,
      elevator,
      navigateTo: `/units/details/${elevator.id}`,
    }));
  return result || [];
};
