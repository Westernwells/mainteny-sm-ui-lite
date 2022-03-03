import {
  GridAlignment,
  GridColDef,
  GridColumnHeaderParams,
  GridRenderCellParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import Typography from '@mui/material/Typography';
import MailIcon from '@mui/icons-material/Mail';
import {StatusChip} from 'components/StatusChip';
import {theme} from 'theme';

const defaultProps = {
  editable: false,
  renderHeader: (params: GridColumnHeaderParams) => (
    <Typography variant="subtitle2">{params.colDef.headerName}</Typography>
  ),
  renderCell: (params: GridRenderCellParams<any, any, any>) => (
    <Typography variant="subtitle2">{params.value}</Typography>
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
    headerName: 'Name',
    type: 'string',
    flex: 2,
    headerAlign: 'left',
    ...defaultProps,
  },
  {
    field: 'number',
    headerName: 'NUMBER',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'address',
    headerName: 'ADDRESS',
    type: 'number',
    flex: 2,
    headerAlign: 'center',
    align: 'center',
    ...defaultProps,
  },
  {
    field: 'units',
    headerName: 'NO. OF UNITS',
    type: 'number',
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'phone',
    headerName: 'PHONE',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'access',
    headerName: 'DASHBOARD ACCESS',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,

    renderCell: (params) => (
      <StatusChip
        color="success"
        label={params.value}
        bgColor={theme.palette.success.main}
      />
    ),
  },
  {
    field: 'actions',
    headerName: 'ACTIONS',
    // TODO: Actions not working as expected
    // type: 'actions',
    // getActions: (params: GridRowParams) => [
    //   <GridActionsCellItem
    //     icon={<FileDownloadOutlinedIcon sx={{color: '#2196F3'}} />}
    //     onClick={() => console.log('ACTION: Click', params.id)}
    //     label="Download"
    //   />,
    // ],
    editable: false,
    sortable: false,
    disableColumnMenu: true,
    disableExport: true,
    ...defaultAlignment,

    renderHeader: (params) => (
      <Typography variant="subtitle2">{params.colDef.headerName}</Typography>
    ),
    renderCell: () => (
      <MailIcon
        sx={{color: '#2196F3'}}
        onClick={() => console.log('ACTION: Download')}
      />
    ),
  },
];

export const makeRows = (customers: any): GridRowsProp =>
  customers
    ? customers.map((item: any, index: number) => ({
        id: index,
        name: item.name,
        number: item.number,
        address: item.address,
        units: item.units,
        phone: item.phone,
        access: item.status,
        navigateTo: item.id,
      }))
    : console.error('No Data');
