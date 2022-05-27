import {
  GridAlignment,
  GridColDef,
  GridColumnHeaderParams,
  GridRenderCellParams,
  GridRowModel,
} from '@mui/x-data-grid';
import Typography from '@mui/material/Typography';
// import {EmployeesView} from 'models/employee';
import Box from '@mui/material/Box';
import {TechnicianEventType} from 'models/misc';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import {ReactComponent as ThermometerIcon} from 'assets/icons/Thermometer.svg';
import {ReactComponent as SunIcon} from 'assets/icons/Sun.svg';
import SendIcon from '@mui/icons-material/Send';
import {capitalize} from 'utils/utils';
import IconButton from '@mui/material/IconButton';
import React from 'react';
import {CommonUserView, Role} from 'models/user';
import {TechnicianEventPair} from 'models/technician';

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
  headerAlign: 'left',
  align: 'left',
};

export const columns: GridColDef[] = [
  {
    field: 'name',
    headerName: 'Name',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
    flex: 2,
  },
  {
    field: 'role',
    headerName: 'ROLE',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
    flex: 2,
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
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
    flex: 4,
  },
  {
    field: 'phone',
    headerName: 'PHONE NUMBER',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
    flex: 2,
  },
  {
    field: 'shift',
    headerName: 'SHIFT',
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
    ...defaultAlignment,
    ...defaultProps,
    editable: false,
    sortable: false,
    disableColumnMenu: true,
    disableExport: true,

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
        <SendIcon sx={{color: 'action.active'}} />
      </IconButton>
    ),
  },
];

export const makeRows = (
  employees: CommonUserView[],
  techniciansEvents: {[key: string]: TechnicianEventPair[]},
): GridRowModel<{[key: string]: any}[]> => {
  console.log('');
  return employees
    ? employees.map((item: CommonUserView, index: number) => {
        let shift = '-';
        let event = 'Available';
        if (item.userAccount.roles.includes(Role.TECHNICIAN)) {
          shift = item.userData.workingHours.length
            ? `${item.userData.workingHours[0].fromTime} - ${item.userData.workingHours[0].toTime}`
            : '-';
          event = techniciansEvents[item.userData.technicianId]
            ? techniciansEvents[item.userData.technicianId][0].eventViews[0]
                .eventType
            : 'Available';
        }
        return {
          id: index,
          name: `${item.userAccount.firstName} ${item.userAccount.lastName}`,
          role: item.userAccount.roles,
          address: item.userData.address?.fullName || '-',
          phone: item.userAccount.contact.phone,
          shift,
          availability: event,
          navigateTo: `details/${item.userAccount.username}`,
          email: item.userAccount.username,
        };
      })
    : [];
};
