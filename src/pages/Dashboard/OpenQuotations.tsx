import useTheme from '@mui/material/styles/useTheme';
import {
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import {nameToInitials} from 'utils/utils';
import {DashboardInfoCard} from './DashboardInfoCard';

export const OpenQuotations = () => {
  const theme = useTheme();
  const quotations = [
    {
      id: 'random1',
      company: 'John Doe',
      total: '4,700€',
      status: 'sent',
    },
    {
      id: 'random2',
      company: 'King Edward',
      total: '4,700€',
      status: 'sent',
    },
    {
      id: 'random3',
      company: 'Noman Gul',
      total: '4,700€',
      status: 'sent',
    },
    {
      id: 'random4',
      company: 'John Doe',
      total: '4,700€',
      status: 'sent',
    },
    {
      id: 'random5',
      company: 'John Doe',
      total: '4,700€',
      status: 'sent',
    },
  ];
  return (
    <DashboardInfoCard
      title="Open quotations"
      chipLabel="05"
      seeMorePath="/quotations">
      <List
        disablePadding
        sx={{
          '& > li:last-child': {
            mask: 'linear-gradient(#FFFFFF, transparent)',
          },
        }}>
        {quotations.map((quotation) => (
          <ListItem
            key={quotation.id}
            sx={{py: '6px', px: '1.5rem'}}
            secondaryAction={
              <Chip
                label={quotation.status}
                size="small"
                sx={{
                  px: '0.28rem',
                  textTransform: 'capitalize',
                  color: '#fff',
                  bgcolor: theme.palette.success.main,
                }}
              />
            }>
            <ListItemAvatar>
              <Avatar sx={{width: 28, height: 28, fontSize: '1rem'}}>
                {nameToInitials(quotation.company)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText sx={{flexBasis: '25%'}}>
              {quotation.company}
            </ListItemText>
            <ListItemText>{quotation.total}</ListItemText>
          </ListItem>
        ))}
      </List>
    </DashboardInfoCard>
  );
};
