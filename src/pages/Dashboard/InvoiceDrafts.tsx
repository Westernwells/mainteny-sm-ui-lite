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

export const InvoiceDrafts = () => {
  const theme = useTheme();
  const invoices = [
    {
      id: 'random1',
      company: 'Lanxess AG',
      total: '4,700€',
      status: 'draft',
    },
    {
      id: 'random2',
      company: 'ThyssenKrupp AG',
      total: '4,700€',
      status: 'draft',
    },
    {
      id: 'random3',
      company: 'Lanxess AG',
      total: '4,700€',
      status: 'draft',
    },
    {
      id: 'random4',
      company: 'John Doe',
      total: '4,700€',
      status: 'draft',
    },
    {
      id: 'random5',
      company: 'ThyssenKrupp AG',
      total: '4,700€',
      status: 'draft',
    },
  ];
  return (
    <DashboardInfoCard
      title="Invoice drafts"
      chipLabel="14"
      seeMorePath="/invoices">
      <List
        disablePadding
        sx={{
          '& > li:last-child': {
            mask: 'linear-gradient(#FFFFFF, transparent)',
          },
        }}>
        {invoices.map((invoice) => (
          <ListItem
            key={invoice.id}
            sx={{py: '6px', px: '1.5rem'}}
            secondaryAction={
              <Chip
                label={invoice.status}
                size="small"
                sx={{
                  px: '0.28rem',
                  textTransform: 'capitalize',
                  color: '#fff',
                  bgcolor: theme.palette.eden.light,
                }}
              />
            }>
            <ListItemAvatar>
              <Avatar sx={{width: 28, height: 28, fontSize: '1rem'}}>
                {nameToInitials(invoice.company)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText sx={{flexBasis: '25%'}}>
              {invoice.company}
            </ListItemText>
            <ListItemText>{invoice.total}</ListItemText>
          </ListItem>
        ))}
      </List>
    </DashboardInfoCard>
  );
};
