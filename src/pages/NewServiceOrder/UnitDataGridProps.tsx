import {
  GridAlignment,
  GridColDef,
  GridColumnHeaderParams,
  GridRenderCellParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import Typography from '@mui/material/Typography';
import {ElevatorView} from 'models/elevator';
import Box from '@mui/material/Box';
import {FormRadio} from 'components/form/FormRadio';
import {useTranslation} from 'react-i18next';
import {FormatDate} from 'models/misc';

const defaultProps = {
  editable: false,
  sortable: false,
  renderHeader: (params: GridColumnHeaderParams) => {
    const {t} = useTranslation();
    return (
      <Typography variant="subtitle2" color="textSecondary">
        {typeof params.colDef.headerName === 'string' &&
          t(params.colDef.headerName)}
      </Typography>
    );
  },
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
    headerName: 'NUMBER',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
    renderHeader: (params: GridColumnHeaderParams) => {
      const {t} = useTranslation();
      return (
        <Typography variant="subtitle2" color="textSecondary">
          {typeof params.colDef.headerName === 'string' &&
            t(params.colDef.headerName)}
        </Typography>
      );
    },
    renderCell: (params: GridRenderCellParams<any, ElevatorView, any>) => (
      <Box sx={{display: 'flex'}}>
        <FormRadio
          value={params.row.id}
          checked={params.row.id === activeId}
          label={params.value || '-'}
          labelProps={{
            variant: 'body2',
            sx: {display: 'flex', alignItems: 'center'},
          }}
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
    field: 'building',
    headerName: 'BUILDING',
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
    field: 'address',
    headerName: 'ADDRESS',
    type: 'number',
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
];

export const makeRows = (
  elevators: ElevatorView[],
  formatDate: FormatDate = () => '',
): GridRowsProp => {
  const result =
    elevators.length &&
    elevators.map((elevator: ElevatorView) => ({
      id: elevator.id,
      number: elevator.externalId,
      model: elevator.model,
      building: elevator.additionalInfo.buildingLocation,
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
