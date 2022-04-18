import {
  GridAlignment,
  GridColDef,
  GridColumnHeaderParams,
  GridRenderCellParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import Typography from '@mui/material/Typography';
import {DataGridLayout} from 'components/DataGridLayout';
import {Box} from '@mui/system';
import {UnitView} from '../model';

interface Props {
  setRowItem: (row: UnitView) => void;
}

const defaultProps = {
  editable: false,
  renderHeader: (params: GridColumnHeaderParams) => (
    <Typography variant="subtitle2" color="textSecondary">
      {params.colDef.headerName}
    </Typography>
  ),
  renderCell: (params: GridRenderCellParams<any, any, any>) => (
    <Typography variant="body2" mx="0.5em">
      {params.value}
    </Typography>
  ),
};
const defaultAlignment: {
  flex: number;
  headerAlign: GridAlignment;
  align: GridAlignment;
} = {
  flex: 1,
  headerAlign: 'center',
  align: 'center',
};

export const columns: GridColDef[] = [
  {
    field: 'unitName',
    headerName: 'UNIT NAME',
    type: 'string',
    flex: 2,
    headerAlign: 'left',
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
    field: 'nextVisit',
    headerName: 'NEXT VISIT',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'availability',
    headerName: 'AVAILABILITY',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'status',
    headerName: 'STATUS',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
  },
];

const rows: GridRowsProp = [
  {
    id: 1,
    unitName: 'KONE TravelMaster 110 ',
    lastVisit: '29 Oct 2021',
    nextVisit: '29 Jan 2022',
    availability: '89%',
    status: 'Stopped',
    address: 'Hotel NH Berlin City, Stussausstraße 2-3, 23920 Oslo',
  },
  {
    id: 2,
    unitName: 'Mitsubiushi',
    lastVisit: '29 Oct 2021',
    nextVisit: '29 Jan 2022',
    availability: '100%',
    status: 'Running',
    address: 'Hotel NH Berlin City, Stussausstraße 2-3, 23920 Oslo',
  },
  {
    id: 3,
    unitName: 'Schindler S2000',
    lastVisit: '24 Sep 2021',
    nextVisit: '24 Dec 2021',
    availability: '100%',
    status: 'Running',
    address: 'Hotel NH Berlin City, Stussausstraße 2-3, 23920 Oslo',
  },
  {
    id: 4,
    unitName: 'Lutz 3000',
    lastVisit: '29 Oct 2021',
    nextVisit: '29 Jan 2022',
    availability: '98%',
    status: 'Running',
    address: 'Hotel NH Berlin City, Stussausstraße 2-3, 23920 Oslo',
  },
  {
    id: 5,
    unitName: 'Schindler S1200',
    lastVisit: '24 Sep 2021',
    nextVisit: '24 Dec 2021',
    availability: '100%',
    status: 'Running',
    address: 'Hotel NH Berlin City, Stussausstraße 2-3, 23920 Oslo',
  },
];

export const UnitDataGrid = ({setRowItem}: Props) => (
  <Box display="flex" flexGrow={1}>
    <DataGridLayout
      rows={rows}
      columns={columns}
      onCellClick={(params) => setRowItem(params.row)}
      hideFooter
    />
  </Box>
);
