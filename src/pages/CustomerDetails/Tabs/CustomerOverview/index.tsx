import {useEffect, useState} from 'react';
import Grid from '@mui/material/Grid';
import {
  Elevator,
  LowPriority,
  FileCopy,
  Email,
  Home,
  LocalPhone,
  Edit,
  Numbers,
} from '@mui/icons-material';
import {useTranslation} from 'react-i18next';
import Typography from '@mui/material/Typography';
import useTheme from '@mui/material/styles/useTheme';
import Box from '@mui/material/Box';
import {Divider} from '@mui/material';

import {CardProps} from 'components/CardProps';
import {InfoCard} from 'components/InfoCard';
import {Progress} from 'components/Progress';
import {TabContentContainer} from 'components/TabContentContainer';
import {useGetCustomer} from 'hooks/reactQuery/useCustomers';
import EmployeeAvatar from 'pages/EmployeeDetails/Tabs/EmployeeOverview/EmployeeAvatar';
import {UnitsWidget} from './UnitsWidget';
import {ContractsWidget} from './ContractsWidget';
import {ContactsWidget} from './ContactsWidget';
import {EditCustomer} from './EditCustomer';

interface Props {
  customerId?: string;
  getCustomerName?: (value: string) => void;
  getCurrentTabIndex?: (val: number) => void;
}

interface BasicDetailsValue {
  label: string;
  value: string;
  icon: JSX.Element;
}

interface BasicDetails {
  [key: string]: BasicDetailsValue;
}

export const CustomerOverviewTab = ({
  customerId,
  getCustomerName,
  getCurrentTabIndex,
}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const {data: customer, isLoading} = useGetCustomer(customerId);
  const [basicDetails, setBasicDetails] = useState<BasicDetails>();
  const [totalUnits, setTotalUnits] = useState(0);
  const [totalContracts, setTotalContracts] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    if (customer) {
      setBasicDetails({
        ...basicDetails,
        address: {
          label: 'ADDRESS',
          value: customer.postalAddress.fullName,
          icon: <Home sx={{color: theme.palette.info.dark}} />,
        },
        phone: {
          label: 'PHONE',
          value: customer.contact.phone || '-',
          icon: <LocalPhone sx={{color: theme.palette.info.dark}} />,
        },
        email: {
          label: 'EMAIL ID',
          value: customer.contact.email,
          icon: <Email sx={{color: theme.palette.info.dark}} />,
        },
        priority: {
          label: 'PRIORITY',
          value: customer.additionalInfo.priority,
          icon: <LowPriority sx={{color: theme.palette.info.dark}} />,
        },
        numberOfUnits: {
          label: 'NO. OF UNITS',
          value: totalUnits.toString() || '-',
          icon: <Elevator sx={{color: theme.palette.info.dark}} />,
        },
        numberOfContracts: {
          label: 'NO. OF CONTRACTS',
          value: totalContracts.toString() || '-',
          icon: <FileCopy sx={{color: theme.palette.info.dark}} />,
        },
        customerNumber: {
          label: 'CUSTOMER NUMBER',
          value: customer.externalId || '-',
          icon: <Numbers sx={{color: theme.palette.info.dark}} />,
        },
      });
    }
  }, [customer, totalContracts, totalUnits]);

  useEffect(() => {
    if (getCustomerName && customer) {
      getCustomerName(customer.name);
    }
  }, [customer]);

  const renderBasicDetails = () => (
    <InfoCard
      header={<Typography variant="subtitle1">{t('Basic Details')}</Typography>}
      containerStyles={{flexGrow: 1}}
      headerStyles={{mt: '0.5em'}}
      handleAction={() => setOpenDialog(true)}
      headerActionIcon={<Edit />}
      showHeaderBackground>
      <Grid container alignItems="center">
        <Grid item xs={2}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              height: '100%',
              width: '80%',
            }}>
            <EmployeeAvatar
              name={customer?.name || ''}
              subTitle={customer?.number || ''}
            />
            <Divider
              orientation="vertical"
              sx={{background: theme.palette.divider}}
              flexItem
            />
          </Box>
        </Grid>
        <Grid item xs={10}>
          <Box display="flex" flexWrap="wrap" mt="-1em">
            {basicDetails &&
              Object.keys(basicDetails).map((item, index) => (
                <CardProps
                  key={index}
                  label={basicDetails[item as keyof BasicDetails].label}
                  icon={basicDetails[item as keyof BasicDetails].icon}
                  containerStyles={{
                    mr: '2em',
                    mt: '1em',
                    width: '30%',
                  }}
                  iconBackground={theme.palette.info.outlinedHoverBg}
                  iconMaxHeight="3rem"
                  bodyText={basicDetails[item as keyof BasicDetails].value}
                />
              ))}
          </Box>
        </Grid>
      </Grid>
      {customer && (
        <EditCustomer
          customer={customer}
          openDialog={openDialog}
          onClose={() => setOpenDialog(false)}
        />
      )}
    </InfoCard>
  );

  if (isLoading) {
    return <Progress />;
  }

  return (
    <TabContentContainer>
      <Grid container columnSpacing={2} rowSpacing={2}>
        <Grid item xs={12}>
          {renderBasicDetails()}
        </Grid>

        <Grid item xs={6}>
          <UnitsWidget
            getTotalUnits={(val) => setTotalUnits(val)}
            customerId={customerId}
            openTab={() => getCurrentTabIndex && getCurrentTabIndex(1)}
          />
        </Grid>

        <Grid item xs={6}>
          <ContractsWidget
            getTotalContracts={(val) => setTotalContracts(val)}
            customerId={customerId}
            openTab={() => getCurrentTabIndex && getCurrentTabIndex(2)}
          />
        </Grid>
        <Grid item xs={12}>
          <ContactsWidget customerId={customerId || ''} />
        </Grid>
      </Grid>
    </TabContentContainer>
  );
};
