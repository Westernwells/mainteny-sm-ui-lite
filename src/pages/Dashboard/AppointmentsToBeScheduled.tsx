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
import {formatDueDate} from 'utils/datetime';
import {DashboardInfoCard} from './DashboardInfoCard';

export const AppointmentsToBeScheduled = () => {
  const theme = useTheme();
  const appointments = [
    {
      id: 'random3fa85f64-5717-4562-b3fc-2c963f66afa6',
      number: '01823989',
      address: 'Thornridge Cir. Shiloh',
      name: 'John Doe',
      phone: '(704) 555-0127',
      dueDate: '2022-08-25',
    },
    {
      id: 'randomdsds84-8asd76-4562-b3fc-2c963f66afa6',
      number: '01823989',
      address: 'Thornridge Cir. Shiloh',
      name: 'Shark Vue',
      phone: '(704) 345-0127',
      dueDate: '2022-07-30',
    },
    {
      id: 'randomdsds84-nsdmnad-4562-b3fc-2c963f66afa6',
      number: '01823989',
      address: 'Thornridge Cir. Shiloh',
      name: 'Wow React',
      phone: '(704) 232-0127',
      dueDate: '2022-08-02',
    },
  ];
  return (
    <DashboardInfoCard
      title="Appointments to be scheduled"
      chipLabel="16"
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
            {appointments.map((appointment) => (
              <TableRow
                key={appointment.name}
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
                    {appointment.address}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption">{appointment.name}</Typography>
                  <br />
                  <Typography
                    variant="caption"
                    sx={{color: theme.palette.text.secondary}}>
                    {appointment.phone}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption">
                    {formatDueDate(appointment.dueDate)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box display="inline-flex">
                    <IconButton>
                      <Message fontSize="small" sx={{color: 'action.active'}} />
                    </IconButton>
                    <IconButton>
                      <Check fontSize="small" sx={{color: 'action.active'}} />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </DashboardInfoCard>
  );
};
