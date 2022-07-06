import {GridColDef, GridRenderCellParams, GridRowsProp} from '@mui/x-data-grid';
import Typography from '@mui/material/Typography';
import {Elevator} from '@mui/icons-material';
import useTheme from '@mui/material/styles/useTheme';

import {getColumnProps} from 'components/DataGridLayout';
import {formatDate} from 'utils/datetime';
import {DataGridElevatorView} from 'pages/Units/Models';

export const columns: GridColDef[] = [
  getColumnProps({
    field: 'number',
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
    field: 'model',
    headerName: 'model',
    align: 'left',
    flex: 2,
  }),
  getColumnProps({
    field: 'customer',
    headerName: 'customer',
    cellClassName: 'truncateText',
    align: 'left',
    flex: 1,
  }),
  getColumnProps({
    field: 'address',
    headerName: 'address',
    cellClassName: 'truncateText',
    align: 'left',
    flex: 2,
  }),
  getColumnProps({
    field: 'lastVisit',
    headerName: 'last visit',
    align: 'left',
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
      number: elevator.externalId || '-',
      address: elevator?.address?.fullName || '-',
      model: elevator.model || '-',
      customer: elevator.propertyOwner.name || '-',
      lastVisit: formatDate(elevator.lastVisitDate),
    }));
  return result || [];
};
