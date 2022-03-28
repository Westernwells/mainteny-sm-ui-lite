import {
  GridAlignment,
  GridColDef,
  GridColumnHeaderParams,
  GridRenderCellParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import Typography from '@mui/material/Typography';
import MailIcon from '@mui/icons-material/Mail';
import {theme} from 'theme';
import {EmployeesView} from 'models/employee';
import {TechnicianEventType} from 'models/misc';
import {StatusChip} from 'components/StatusChip';

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
    headerName: 'Name',
    type: 'string',
    flex: 2,
    headerAlign: 'left',
    align: 'left',
    ...defaultProps,
  },
  {
    field: 'role',
    headerName: 'ROLE',
    type: 'string',
    flex: 1,
    headerAlign: 'left',
    align: 'left',
    ...defaultProps,
    renderCell: (params) => {
      const role = (params.value as string)
        .split(' ')
        .map((item) => `${item[0]}${item.slice(1).toLowerCase()}`);
      return (
        <Typography
          variant="body2"
          mx="0.5em"
          sx={{textTransform: 'capitalize'}}>
          {role.join(' ')}
        </Typography>
      );
    },
  },
  {
    field: 'address',
    headerName: 'ADDRESS',
    type: 'number',
    flex: 4,
    headerAlign: 'left',
    align: 'left',
    ...defaultProps,
  },
  {
    field: 'phone',
    headerName: 'PHONE NUMBER',
    type: 'string',
    flex: 1,
    headerAlign: 'left',
    align: 'left',
    ...defaultProps,
  },
  {
    field: 'shift',
    headerName: 'SHIFT',
    type: 'number',
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'availability',
    headerName: 'AVAILABILITY',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,

    renderCell: (params) => (
      <StatusChip
        color="success"
        label={`${(params.value as string)[0]}${(params.value as string)
          .slice(1)
          .toLowerCase()}`}
        bgColor={
          params.value === TechnicianEventType.HOLIDAY
            ? theme.palette.warning.main
            : theme.palette.success.main
        }
      />
    ),
  },
  {
    field: 'message',
    headerName: 'MESSAGE',
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

export const makeRows = (employees: any): GridRowsProp =>
  employees
    ? employees.map((item: EmployeesView, index: number) => ({
        id: index,
        name: `${item.userAccount.firstName} ${item.userAccount.lastName}`,
        role: item.userAccount.roles[0].split('_').join(' '),
        address: item.address?.fullName || '-',
        phone: item.userAccount.contact.phone,
        shift:
          item.workingHours && item.workingHours.length
            ? `${item.workingHours[0].fromTime} - ${item.workingHours[0].toTime}`
            : '-',
        availability: item.events ? item.events[0].eventType : 'Available',
        navigateTo: item.userAccount.username,
      }))
    : console.error('No Data');
