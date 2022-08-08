import {Link as RouterLink} from 'react-router-dom';
import useTheme from '@mui/material/styles/useTheme';
import {
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import {nameToInitials} from 'utils/utils';
import {formatCurrency} from 'utils/currency';
import {Resource} from 'models/misc';
import {QuotationView} from 'models/quotation';
import {DashboardInfoCard} from './DashboardInfoCard';

export const OpenQuotations = ({
  quotations,
}: {
  quotations: Resource<QuotationView>;
}) => {
  const theme = useTheme();
  return (
    <DashboardInfoCard
      title="Open quotations"
      chipLabel={`${quotations.total}`}
      seeMorePath="/quotations">
      <List
        disablePadding
        sx={{
          '& > li:last-child': {
            mask: 'linear-gradient(#FFFFFF, transparent)',
          },
        }}>
        {quotations.data.map((quotation) => (
          <ListItem
            key={quotation.id}
            sx={{py: '6px', px: '1.5rem'}}
            secondaryAction={
              <Chip
                label="Sent"
                size="small"
                sx={{
                  px: '0.28rem',
                  textTransform: 'capitalize',
                  color: '#fff',
                  bgcolor: theme.palette.success.main,
                }}
              />
            }>
            <ListItemButton
              component={RouterLink}
              to={`/quotations/details/${quotation.id}`}
              sx={{p: '0px !important'}}>
              <ListItemAvatar>
                <Avatar sx={{width: 28, height: 28, fontSize: '1rem'}}>
                  {nameToInitials(quotation.elevator.propertyOwner.name)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText sx={{flexBasis: '25%'}}>
                {quotation.elevator.propertyOwner.name}
              </ListItemText>
              <ListItemText>
                {formatCurrency(
                  quotation
                    ? quotation.totalAmount.netAmount /
                        10 ** quotation.totalAmount.fractionDigits!
                    : 0,
                  {
                    currency: quotation.totalAmount.currency,
                  },
                )}
              </ListItemText>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </DashboardInfoCard>
  );
};
