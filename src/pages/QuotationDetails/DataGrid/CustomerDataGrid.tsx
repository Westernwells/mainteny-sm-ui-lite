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
import {CustomerView} from '../model';

interface Props {
  setRowItem: (row: CustomerView) => void;
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
    field: 'name',
    headerName: 'NAME',
    type: 'string',
    flex: 2,
    headerAlign: 'left',
    ...defaultProps,
  },
  {
    field: 'customerNumber',
    headerName: 'CUSTOMER NO.',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'address',
    headerName: 'ADDRESS',
    type: 'string',
    flex: 2,
    headerAlign: 'left',
    ...defaultProps,
  },
  {
    field: 'unitCount',
    headerName: 'NO OF UNITS',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'phone',
    headerName: 'PHONE NO.',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
  },
];

const rows: GridRowsProp = [
  {
    id: 1,
    name: 'Hotel NH Berlin City',
    customerNumber: '7893001',
    address: 'Stussausstraße 2-3, 23920 Oslo',
    unitCount: '15',
    phone: '+49 30 55757000',
  },
  {
    id: 2,
    name: 'Park Inn by Radisson',
    customerNumber: '71398581',
    address: 'Winkelsstraße 18A, 2392ND Munich',
    unitCount: '200',
    phone: '+49 30 55757000',
  },
  {
    id: 3,
    name: 'St Christophers Inn',
    customerNumber: '4914109',
    address: 'Stussausstraße 2-3, 23920 Oslo',
    unitCount: '58',
    phone: '+49 30 55757000',
  },
  {
    id: 4,
    name: 'Hilton Berlin',
    customerNumber: '5875310',
    address: 'Winkelsstraße 18A, 2392ND Munich',
    unitCount: '1000',
    phone: '+49 30 55757000',
  },
  {
    id: 5,
    name: 'Hotel Novalis',
    customerNumber: '41901018',
    address: 'Roostenstraße 4M, 208800 Nether..',
    unitCount: '12',
    phone: '+49 30 55757000',
  },
];

export const CustomerDataGrid = ({setRowItem}: Props) => (
  <Box display="flex" flexGrow={1}>
    <DataGridLayout
      rows={rows}
      columns={columns}
      onCellClick={(params: any) => setRowItem(params.row)}
      hideFooter
    />
  </Box>
);
