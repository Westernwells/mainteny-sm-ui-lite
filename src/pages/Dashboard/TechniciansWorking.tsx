import useTheme from '@mui/material/styles/useTheme';
import {
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import {getEmployeeStatus} from 'utils/work-hours-utils';
import {Resource} from 'models/misc';
import {EmployeeStatus, EmployeeStatusView} from 'models/employee';
import {DashboardInfoCard} from './DashboardInfoCard';

export const TechniciansWorking = ({
  technicians,
}: {
  technicians: Resource<EmployeeStatusView>;
}) => {
  const theme = useTheme();
  return (
    <DashboardInfoCard
      title="Technicians working"
      chipLabel={`${technicians.total}`}
      seeMorePath="/employees">
      <List
        disablePadding
        sx={{
          '& > li:last-child': {
            mask: 'linear-gradient(#FFFFFF, transparent)',
          },
        }}>
        {technicians.data.map((technician) => (
          <ListItem
            key={technician.employee.id}
            sx={{py: '6px', px: '1.5rem'}}
            secondaryAction={
              <Chip
                label={getEmployeeStatus(technician.status)}
                size="small"
                sx={{
                  px: '0.28rem',
                  textTransform: 'capitalize',
                  color: '#fff',
                  bgcolor:
                    technician.status === EmployeeStatus.PUBLIC_HOLIDAY ||
                    technician.status === EmployeeStatus.HOLIDAY ||
                    technician.status === EmployeeStatus.WEEKEND
                      ? theme.palette.info.main
                      : technician.status === EmployeeStatus.SICK_LEAVE
                      ? theme.palette.warning.main
                      : theme.palette.primary.main,
                }}
              />
            }>
            <ListItemAvatar>
              <Avatar
                alt={technician.employee.userAccount.firstName}
                src={technician.employee.userAccount.photoUrl}
                sx={{width: 28, height: 28}}
              />
            </ListItemAvatar>
            <ListItemText>
              {technician.employee.userAccount.firstName}{' '}
              {technician.employee.userAccount.lastName}
            </ListItemText>
          </ListItem>
        ))}
      </List>
    </DashboardInfoCard>
  );
};
