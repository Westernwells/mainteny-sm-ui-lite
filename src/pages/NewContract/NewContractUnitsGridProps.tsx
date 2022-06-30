import {GridColDef, GridRenderCellParams, GridRowsProp} from '@mui/x-data-grid';
import Typography from '@mui/material/Typography';
import ElevatorIcon from '@mui/icons-material/Elevator';
import {getColumnProps} from 'components/DataGridLayout';
import {formatDate} from 'utils/datetime';
import {DataGridElevatorView} from 'pages/Units/Models';

export const columns: GridColDef[] = [
  getColumnProps({
    field: 'number',
    headerName: 'unit number',
    align: 'center',
    flex: 1.25,
  }),
  getColumnProps({
    field: 'model',
    headerName: 'model',
    flex: 2,
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
    flex: 2,
  }),
];

export const makeRows = ({
  elevators,
}: {
  elevators: DataGridElevatorView[];
}): GridRowsProp => {
  const result =
    elevators.length &&
    elevators.map((elevator: DataGridElevatorView) => ({
      id: elevator.id,
      number: elevator.number,
      model: elevator.model,
      customer: elevator.propertyOwner.name,
      lastVisit: formatDate(elevator.lastVisitDate),
    }));
  return result || [];
};
