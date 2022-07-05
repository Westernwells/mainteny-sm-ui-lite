import {useTranslation} from 'react-i18next';
import {GridColDef, GridRowModel} from '@mui/x-data-grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {TechnicianEventType} from 'models/misc';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import {ReactComponent as ThermometerIcon} from 'assets/icons/Thermometer.svg';
import {ReactComponent as SunIcon} from 'assets/icons/Sun.svg';
import SendIcon from '@mui/icons-material/Send';
import {capitalize} from 'utils/utils';
import IconButton from '@mui/material/IconButton';
import React from 'react';
import {getColumnProps} from 'components/DataGridLayout';
import {UserView, Role} from 'models/user';
import {TechnicianEventPair} from 'models/technician';

export const columns: GridColDef[] = [
  getColumnProps({
    field: 'name',
    headerName: 'Name',
    flex: 1.5,
  }),
  getColumnProps({
    field: 'role',
    headerName: 'role',
    cellClassName: 'truncateText',
    renderCell: (params) => {
      const {t} = useTranslation();
      const role = capitalize(params.value);
      return (
        <Typography variant="body2" sx={{textTransform: 'capitalize'}}>
          {t(role)}
        </Typography>
      );
    },
    flex: 1.5,
  }),
  getColumnProps({
    field: 'address',
    headerName: 'address',
    cellClassName: 'truncateText',
    flex: 1.5,
  }),
  getColumnProps({
    field: 'phone',
    headerName: 'phone',
    flex: 1.5,
  }),
  getColumnProps({
    field: 'shift',
    headerName: 'shift',
    align: 'center',
    flex: 0,
  }),
  getColumnProps({
    field: 'availability',
    headerName: 'availability',
    renderCell: (params) => {
      const {t} = useTranslation();

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
                  {t('Holiday')}
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
                  {t('Sick')}
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
                <Typography variant="body2" ml="0.5em">
                  {t('Available')}
                </Typography>
              </Box>
            </Box>
          );
      }
    },
    align: 'center',
  }),
  getColumnProps({
    field: 'actions',
    headerName: 'actions',
    renderCell: (params) => (
      <IconButton
        component="a"
        onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
          e.stopPropagation();
          window.open(`mailto:${params.value}`, '_blank');
        }}>
        <SendIcon fontSize="small" sx={{color: 'action.active'}} />
      </IconButton>
    ),
    align: 'center',
    flex: 0,
  }),
];

export const makeRows = (
  employees: UserView[],
  techniciansEvents: {[key: string]: TechnicianEventPair[]},
): GridRowModel<{[key: string]: any}[]> =>
  employees
    ? employees.map((item: UserView, index: number) => {
        let shift = '-';
        let event = 'Available';
        if (item.userAccount.roles.includes(Role.TECHNICIAN)) {
          shift = item.userData.workingHours.length
            ? `${item.userData.workingHours[0].fromTime} - ${item.userData.workingHours[0].toTime}`
            : '-';
          event = techniciansEvents[item.userData.employeeId]
            ? techniciansEvents[item.userData.employeeId][0].eventViews[0]
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
          navigateTo: `details/${item.id}`,
          actions: item.userAccount.contact.email,
        };
      })
    : [];
