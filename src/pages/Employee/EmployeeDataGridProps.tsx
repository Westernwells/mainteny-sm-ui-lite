import {
  GridAlignment,
  GridColDef,
  GridColumnHeaderParams,
  GridRenderCellParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import Typography from '@mui/material/Typography';
import {EmployeesView} from 'models/employee';
import Box from '@mui/material/Box';
import {TechnicianEventType} from 'models/misc';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import {ReactComponent as ThermometerIcon} from 'assets/icons/Thermometer.svg';
import {ReactComponent as SunIcon} from 'assets/icons/Sun.svg';
import SendIcon from '@mui/icons-material/Send';
import {capitalize} from 'utils/utils';
import IconButton from '@mui/material/IconButton';
import React from 'react';

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
    flex: 2,
    headerAlign: 'left',
    align: 'left',
    ...defaultProps,
    renderCell: (params) => {
      // [0].split('_').join(' ')
      const role = capitalize(params.value);
      return (
        <Typography
          variant="body2"
          mx="0.5em"
          sx={{textTransform: 'capitalize'}}>
          {role}
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
    flex: 1,
    headerAlign: 'left',
    align: 'left',
    ...defaultProps,

    renderCell: (params) => {
      switch (params.value) {
        case TechnicianEventType.HOLIDAY:
          return (
            <Box display="flex" mx="0.5em">
              <Box>
                <SunIcon
                  style={{
                    height: '16.5px',
                    width: '0.9375rem',
                    marginTop: '0.1em',
                  }}
                />
              </Box>
              <Box>
                <Typography variant="body2" ml="0.5em">
                  Holiday
                </Typography>
              </Box>
            </Box>
          );
        case TechnicianEventType.SICK_LEAVE:
          return (
            <Box display="flex">
              <Box>
                <ThermometerIcon
                  style={{
                    height: '16.5px',
                    width: '0.9375rem',
                    marginTop: '0.1em',
                  }}
                />
              </Box>
              <Box>
                <Typography variant="body2" ml="0.5em">
                  Sick
                </Typography>
              </Box>
            </Box>
          );
        default:
          return (
            <Box display="flex">
              <Box>
                <CalendarTodayIcon
                  sx={{height: 16.5, width: '0.9375rem', marginTop: '0.1em'}}
                />
              </Box>
              <Box>
                {' '}
                <Typography variant="body2" ml="0.5em">
                  Available
                </Typography>
              </Box>
            </Box>
          );
      }
    },
  },
  {
    field: 'email',
    headerName: 'EMAIL',
    editable: false,
    sortable: false,
    disableColumnMenu: true,
    disableExport: true,
    ...defaultAlignment,

    renderHeader: (params) => (
      <Typography variant="subtitle2" color="textSecondary">
        {params.colDef.headerName}
      </Typography>
    ),
    renderCell: (params) => (
      <IconButton
        component="a"
        onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
          e.stopPropagation();
          window.open(`mailto:${params.value}`, '_blank');
        }}>
        <SendIcon sx={{color: '#2196F3'}} />
      </IconButton>
    ),
  },
];

export const makeRows = (employees: any): GridRowsProp =>
  employees
    ? employees.map((item: EmployeesView, index: number) => ({
        id: index,
        name: `${item.userAccount.firstName} ${item.userAccount.lastName}`,
        role: item.userAccount.roles,
        address: item.address?.fullName || '-',
        phone: item.userAccount.contact.phone,
        shift:
          item.workingHours && item.workingHours.length
            ? `${item.workingHours[0].fromTime} - ${item.workingHours[0].toTime}`
            : '-',
        availability: item.events ? item.events[0].eventType : 'Available',
        navigateTo: `details/${item.userAccount.username}`,
        email: item.userAccount.username,
      }))
    : console.error('No Data');
