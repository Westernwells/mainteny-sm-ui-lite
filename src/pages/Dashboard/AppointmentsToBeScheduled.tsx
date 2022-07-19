import {AxiosResponse} from 'axios';
import {UseMutationResult} from 'react-query';
import useTheme from '@mui/material/styles/useTheme';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material';
import {Message} from '@mui/icons-material';
import Check from '@mui/icons-material/Check';
import {Resource, StringValue} from 'models/misc';
import {ServiceOrderView} from 'models/service-order';
import {formatDueDate} from 'utils/datetime';
import {DashboardInfoCard} from './DashboardInfoCard';

export const AppointmentsToBeScheduled = ({
  appointments,
  appointmentNotificationMutation,
}: {
  appointments: Resource<ServiceOrderView>;
  appointmentNotificationMutation: UseMutationResult<
    AxiosResponse<StringValue, any>,
    unknown,
    string,
    unknown
  >;
}) => {
  const theme = useTheme();
  return (
    <DashboardInfoCard
      title="Appointments to be scheduled"
      chipLabel={`${appointments.total}`}
      seeMorePath="/orders?tab=1">
      <TableContainer
        component={Paper}
        sx={{boxShadow: 'none', overflow: 'visible'}}>
        <Table
          aria-label="simple table"
          size="small"
          sx={{
            borderCollapse: 'separate',
            borderSpacing: '0 1rem',
            my: '-0.6rem',
          }}>
          <TableBody>
            {appointments.data.map((appointment) => {
              const technician =
                appointment.schedules?.[0]?.technician.userAccount;
              const technicianName = `${technician?.firstName ?? ''} ${
                technician?.lastName ?? ''
              }`;
              const technicianPhone = technician?.contact.phone ?? '';
              return (
                <TableRow
                  key={appointment.id}
                  sx={{
                    'td:not(:last-child)': {
                      borderRight: '1px solid #eeeeee',
                      padding: '0.5rem',
                    },
                  }}>
                  <TableCell>
                    <Typography variant="caption">
                      {appointment.number}
                    </Typography>
                    <br />
                    <Typography
                      variant="caption"
                      sx={{color: theme.palette.text.secondary}}>
                      {appointment.elevator.address.fullName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">{technicianName}</Typography>
                    <br />
                    <Typography
                      variant="caption"
                      sx={{color: theme.palette.text.secondary}}>
                      {technicianPhone}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {formatDueDate(
                        appointment.additionalInfo
                          .appointmentNotificationDueDate ?? '',
                      )}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="inline-flex">
                      <IconButton
                        onClick={() =>
                          appointmentNotificationMutation.mutate(appointment.id)
                        }>
                        <Message
                          fontSize="small"
                          sx={{color: 'action.active'}}
                        />
                      </IconButton>
                      <IconButton>
                        <Check fontSize="small" sx={{color: 'action.active'}} />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </DashboardInfoCard>
  );
};
