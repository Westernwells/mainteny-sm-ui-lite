import {useEffect, useState} from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import {useTranslation} from 'react-i18next';
import Typography from '@mui/material/Typography';
import useTheme from '@mui/material/styles/useTheme';
import {Address} from 'models/misc';
import {Progress} from 'components/Progress';
import {TabContentContainer} from 'components/TabContentContainer';
import {useDeleteCustomer, useGetCustomer} from 'hooks/reactQuery/useCustomers';
import {ContactPersonAssociationType} from 'models/contacts';
import {Box, Button, TextField, Grid2 as Grid} from '@mui/material';
import Notes from 'pages/CustomerDetails/Notes';
import {ConfirmDelete} from 'components/ConfirmDelete';
import CustomerPortalWidget from './CustomerPortalWidget';
import PerformanceWidget from './PerformanceWidget';
import GeneralInformationWidget from './GeneralInformationWidget';
import FinanceWidget from './FinanceWidget';
import ContactsWidget from './ContactsWidget';

interface Props {
  customerId: string;
  getCustomerName?: (value: string) => void;
}

export const formatAddress = (address: Address | undefined) => {
  if (!address) return '-';

  const name = address?.component?.name ? address?.component?.name : '';
  const address1 = address?.component?.street ? address?.component?.street : '';
  const address2 = address?.component?.street2
    ? address?.component?.street2
    : '';
  const zip = address?.component?.postalCode
    ? address?.component?.postalCode
    : '';
  const city = address?.component?.city ? address?.component?.city : '';
  const country = address?.component?.country
    ? address?.component?.country
    : '';
  const moreInfo = address?.component?.moreInfo
    ? address?.component?.moreInfo
    : '';

  return (
    <Typography
      variant="body2"
      sx={{
        textWrap: 'wrap',
      }}>
      {name} {address1} {address2} {zip} {city} {country} {moreInfo}
    </Typography>
  );
};

export const CustomerOverviewTab = ({customerId, getCustomerName}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const {data: customer, isLoading} = useGetCustomer(customerId);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const {mutateAsync: deleteCustomer, isLoading: isDeleting} =
    useDeleteCustomer('Customer deleted successfully');
  const customerPortalEnabled =
    !!customer?.additionalInfo?.customerPortalEnabled;

  const handleMenuItemClick = () => {
    setOpenDeleteConfirm(true);
  };

  useEffect(() => {
    if (getCustomerName && customer) {
      getCustomerName(customer.name);
    }
  }, [customer]);

  if (isLoading) {
    return <Progress />;
  }

  return (
    <TabContentContainer>
      <Grid container spacing={2} paddingBottom={5}>
        <Grid size={{xs: 12}}>
          <PerformanceWidget customer={customer!} />
        </Grid>

        <Grid size={{md: 6}}>
          <GeneralInformationWidget customer={customer!} />
        </Grid>

        <Grid size={{md: 6}}>
          <FinanceWidget customer={customer!} />
        </Grid>

        <Grid size={{xs: 12}}>
          <ContactsWidget
            refId={customerId!}
            refType={ContactPersonAssociationType.PROPERTY_OWNER}
          />
        </Grid>

        <Grid size={{xs: 12}}>
          <CustomerPortalWidget
            customerId={customerId!}
            customerPortalEnabled={customerPortalEnabled}
          />
        </Grid>
      </Grid>

      <Box
        sx={{
          position: 'fixed',
          zIndex: 20,
          left: `calc(${theme.spacing(7)} - 1px)`,
          [theme.breakpoints.up('sm')]: {
            left: `calc(${theme.spacing(9)} - 1px)`,
          },
          right: 0,
          bottom: 0,
          background: theme.palette.background.paper,
          boxShadow: theme.shadows[3],
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0.6rem 2rem',
        }}>
        <Box>
          <Button
            variant="text"
            color="primary"
            onClick={handleMenuItemClick}
            sx={{
              color: '#FC5555',
              backgroundColor: 'white',
              margin: '0em 0.5rem',
            }}
            startIcon={<DeleteIcon />}>
            {t('Delete customer')}
          </Button>
        </Box>

        <Box>
          <Notes customerId={customerId} />
        </Box>

        <ConfirmDelete
          confirmText="Delete"
          saveLoading={isDeleting}
          title={t(`Delete customer`)}
          body={[
            t('You are about to delete customer "{{customerName}}"', {
              customerName: customer?.name,
            }),
            t('Enter the type name to confirm deletion.'),
          ]}
          dialogContent={
            <TextField
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
              }}
              size="small"
              fullWidth
              sx={{mt: 2, mb: 1}}
              label={t('Customer name')}
              InputLabelProps={{shrink: true}}
            />
          }
          buttonSx={{
            bgcolor: 'error.light',
            color: 'primary.contrastText',
            '&:hover': {
              bgcolor: 'error.light',
              color: 'primary.contrastText',
            },
          }}
          disableSave={
            customerName.toLowerCase() !== customer?.name?.toLowerCase()
          }
          open={openDeleteConfirm ?? false}
          onConfirm={async () => {
            await deleteCustomer(customerId!);
          }}
          onClose={() => {
            setOpenDeleteConfirm(false);
          }}
        />
      </Box>
    </TabContentContainer>
  );
};
