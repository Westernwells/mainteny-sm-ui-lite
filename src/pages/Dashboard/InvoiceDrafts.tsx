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
import {InvoiceView} from 'models/invoice';
import {useTranslation} from 'react-i18next';
import {DashboardInfoCard} from './DashboardInfoCard';

export const InvoiceDrafts = ({
  invoices,
}: {
  invoices: Resource<InvoiceView>;
}) => {
  const {t} = useTranslation();
  const theme = useTheme();
  return (
    <DashboardInfoCard
      title="Invoice drafts"
      chipLabel={`${invoices.total}`}
      seeMorePath="/invoices"
      emptySection={{
        show: !invoices.total,
        label: 'No Invoices.',
      }}
      bodyContainerStyle={{
        height: '100%',
      }}>
      <List
        disablePadding
        sx={{
          ...(invoices.data.length >= 5
            ? {
                '& > li:last-child': {
                  mask: 'linear-gradient(#FFFFFF, transparent)',
                },
              }
            : {}),
        }}>
        {invoices.data.map((invoice) => (
          <ListItem
            key={invoice.id}
            sx={{py: '6px', px: '1.5rem'}}
            secondaryAction={
              <Chip
                label={t('Draft')}
                size="small"
                sx={{
                  px: '0.28rem',
                  textTransform: 'capitalize',
                  color: '#fff',
                  bgcolor: theme.palette.eden.light,
                }}
              />
            }>
            <ListItemButton
              component={RouterLink}
              to={`/invoices/details/${invoice.id}`}
              sx={{p: '0px !important'}}>
              <ListItemAvatar>
                <Avatar sx={{width: 28, height: 28, fontSize: '1rem'}}>
                  {nameToInitials(invoice.propertyOwner.name)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText sx={{flexBasis: '25%'}}>
                {invoice.propertyOwner.name}
              </ListItemText>
              <ListItemText>
                {formatCurrency(
                  invoice
                    ? (invoice.totalAmount?.netAmount ?? 0) /
                        10 ** invoice.totalAmount.fractionDigits!
                    : 0,
                  {
                    currency: invoice.totalAmount.currency,
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
