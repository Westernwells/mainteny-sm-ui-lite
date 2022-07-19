import useTheme from '@mui/material/styles/useTheme';
import {
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import {DashboardInfoCard} from './DashboardInfoCard';

export const TechniciansWorking = () => {
  const theme = useTheme();
  const technicians = [
    {
      id: 'random1',
      firstName: 'Andre',
      lastName: 'Kraus',
      photoUrl:
        'https://dev-to-uploads.s3.amazonaws.com/uploads/user/profile_image/137034/43002845-0d4d-40cb-ba98-2759b1bf0a4f.jpg',
      status: 'working',
    },
    {
      id: 'random2',
      firstName: 'Andre',
      lastName: 'Zeller',
      photoUrl:
        'https://dev-to-uploads.s3.amazonaws.com/uploads/user/profile_image/137034/43002845-0d4d-40cb-ba98-2759b1bf0a4f.jpg',
      status: 'working',
    },
    {
      id: 'random3',
      firstName: 'Tobias',
      lastName: 'Dietrich',
      photoUrl:
        'https://dev-to-uploads.s3.amazonaws.com/uploads/user/profile_image/137034/43002845-0d4d-40cb-ba98-2759b1bf0a4f.jpg',
      status: 'holiday',
    },
    {
      id: 'random4',
      firstName: 'Noman',
      lastName: 'Gul',
      photoUrl:
        'https://dev-to-uploads.s3.amazonaws.com/uploads/user/profile_image/137034/43002845-0d4d-40cb-ba98-2759b1bf0a4f.jpg',
      status: 'sick',
    },
    {
      id: 'random5',
      firstName: 'Ludger',
      lastName: 'Bergmann',
      photoUrl:
        'https://dev-to-uploads.s3.amazonaws.com/uploads/user/profile_image/137034/43002845-0d4d-40cb-ba98-2759b1bf0a4f.jpg',
      status: 'sick',
    },
  ];
  return (
    <DashboardInfoCard
      title="Technicians working"
      chipLabel="07"
      seeMorePath="/employees">
      <List
        disablePadding
        sx={{
          '& > li:last-child': {
            mask: 'linear-gradient(#FFFFFF, transparent)',
          },
        }}>
        {technicians.map((technician) => (
          <ListItem
            key={technician.id}
            sx={{py: '6px', px: '1.5rem'}}
            secondaryAction={
              <Chip
                label={technician.status}
                size="small"
                sx={{
                  px: '0.28rem',
                  textTransform: 'capitalize',
                  color: '#fff',
                  bgcolor:
                    technician.status === 'holiday'
                      ? theme.palette.info.main
                      : technician.status === 'sick'
                      ? theme.palette.warning.main
                      : theme.palette.primary.main,
                }}
              />
            }>
            <ListItemAvatar>
              <Avatar
                alt={technician.id}
                src={technician.photoUrl}
                sx={{width: 28, height: 28}}
              />
            </ListItemAvatar>
            <ListItemText>
              {technician.firstName} {technician.lastName}
            </ListItemText>
          </ListItem>
        ))}
      </List>
    </DashboardInfoCard>
  );
};
