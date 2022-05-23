import {
  GridAlignment,
  GridColDef,
  GridColumnHeaderParams,
  GridRenderCellParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import Typography from '@mui/material/Typography';
import {ElevatorView} from 'models/elevator';
import {formatDate} from 'utils/datetime';
import Box from '@mui/material/Box';
import {FormRadio} from 'components/form/FormRadio';

const defaultProps = {
  editable: false,
  sortable: false,
  renderHeader: (params: GridColumnHeaderParams) => (
    <Typography variant="subtitle2" color="textSecondary">
      {params.colDef.headerName}
    </Typography>
  ),
  renderCell: (params: GridRenderCellParams<any, any, any>) => (
    <Typography variant="body2">{params.value || '-'}</Typography>
  ),
};
const defaultAlignment: {
  flex: number;
  headerAlign: GridAlignment;
  align: GridAlignment;
} = {
  flex: 1,
  headerAlign: 'left',
  align: 'left',
};

export const columns = (activeId: string): GridColDef[] => [
  {
    field: 'number',
    headerName: 'UNIT NUMBER',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
    renderHeader: (params: GridColumnHeaderParams) => (
      <Typography variant="subtitle2" color="textSecondary">
        {params.colDef.headerName}
      </Typography>
    ),
    renderCell: (params: GridRenderCellParams<any, ElevatorView, any>) => (
      <Box sx={{display: 'flex'}}>
        <FormRadio
          value={params.row.id}
          checked={params.row.id === activeId}
          label={
            <Typography
              variant="body2"
              component="div"
              sx={{display: 'flex', alignItems: 'center'}}>
              {params.value || '-'}
            </Typography>
          }
        />
      </Box>
    ),
  },
  {
    field: 'model',
    headerName: 'MODEL',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'customer',
    headerName: 'CUSTOMER',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'lastVisit',
    headerName: 'LAST VISIT',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'address',
    headerName: 'ADDRESS',
    type: 'number',
    ...defaultAlignment,
    ...defaultProps,
  },
];

export const makeRows = (elevators: ElevatorView[]): GridRowsProp => {
  const result =
    elevators.length &&
    elevators.map((elevator: ElevatorView) => ({
      id: elevator.id,
      number: elevator.number,
      model: elevator.model,
      customer: elevator.propertyOwner.name,
      lastVisit: formatDate(elevator.lastVisitDate),
      nextVisit: formatDate(elevator.nextVisitDate),
      address: elevator.address.fullName,
      status: elevator.status,
      headerText: elevator.address.fullName,
      elevator,
    }));
  return result || [];
};
