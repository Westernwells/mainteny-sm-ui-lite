import WorkIcon from '@mui/icons-material/Work';
import HomeIcon from '@mui/icons-material/Home';
import EmailIcon from '@mui/icons-material/Email';
import Grid from '@mui/material/Grid';
import {CardProps} from 'components/CardProps';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import {BasicDetailsCard} from 'components/BasicDetailsCard';
import Typography from '@mui/material/Typography';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import useTheme from '@mui/material/styles/useTheme';
import Box from '@mui/material/Box';
import {formatDate, getDateObject} from 'utils/datetime';
import {useGetCustomer} from 'hooks/reactQuery/useCustomers';

import {PageCard} from 'components/PageCard';
import {Searchnput} from 'components/SearchInput';
import {useEffect, useState} from 'react';

interface Props {
  customerId?: string;
  getCustomerName?: (value: string) => void;
}

export const CustomerOverviewTab = ({customerId, getCustomerName}: Props) => {
  const theme = useTheme();
  const {data: customer} = useGetCustomer(customerId);
  const [basicDetails, setBasicDetails] = useState<BasicDetails>();

  useEffect(() => {
    if (customer) {
      setBasicDetails({
        ...basicDetails,
        name: {
          label: 'CUSTOMER NAME',
          value: customer.name,
          icon: <HomeWorkIcon sx={{color: theme.palette.info.dark}} />,
        },
        phone: {
          label: 'PHONE NUMBER',
          value: customer.contact.phone,
          icon: <LocalPhoneIcon sx={{color: theme.palette.info.dark}} />,
        },
        address: {
          label: 'ADDRESS',
          value: customer.address.fullName,
          icon: <HomeIcon sx={{color: theme.palette.info.dark}} />,
        },
        email: {
          label: 'EMAIL ID',
          value: customer.contact.email,
          icon: <EmailIcon sx={{color: theme.palette.info.dark}} />,
        },
        startDate: {
          label: 'CUSTOMER SINCE',
          value: formatDate(
            getDateObject(customer.meta.createdAt),
            'dd MMMM yyy',
          ) as string,
          icon: <WorkIcon sx={{color: theme.palette.info.dark}} />,
        },
      });
    }
  }, [customer]);

  useEffect(() => {
    if (getCustomerName && customer) {
      getCustomerName(customer.name);
    }
  }, [customer]);

  const renderBasicDetails = () => (
    <BasicDetailsCard
      minHeight="12rem"
      headerStyles={{pb: '0'}}
      header={<Typography variant="subtitle1">Basic Details</Typography>}>
      <Box display="flex" flexWrap="wrap">
        {basicDetails &&
          Object.keys(basicDetails).map((item) => (
            <CardProps
              label={basicDetails[item as keyof BasicDetails].label}
              bodyTextVariant="body2"
              icon={basicDetails[item as keyof BasicDetails].icon}
              containerStyles={{mr: '2em', mt: '1em', width: '30%'}}
              iconBackground={theme.palette.info.outlinedHoverBg}
              iconMaxHeight="3rem"
              bodyText={basicDetails[item as keyof BasicDetails].value}
            />
          ))}
      </Box>
    </BasicDetailsCard>
  );

  return (
    <Box>
      {renderBasicDetails()}
      <Grid container spacing={2} sx={{mt: '1em'}}>
        <Grid item xs={6}>
          <PageCard
            headerContainerOverrideStyles={{backgroundColor: '#fff'}}
            customHeader={
              <Box display="flex" justifyContent="space-between">
                <Box display="flex">
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: theme.palette.text.primary,
                    }}>
                    Units
                  </Typography>
                  <Typography variant="subtitle1" color="textSecondary">
                    (500)
                  </Typography>
                </Box>
                <Searchnput
                  size="small"
                  placeholder="Search"
                  containerStyle={{
                    background: theme.palette.inputBackground.main,
                    width: '12rem',
                  }}
                />
              </Box>
            }>
            <Typography>sksks</Typography>
          </PageCard>
        </Grid>

        <Grid item xs={6}>
          <PageCard
            customHeader={
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: theme.palette.text.primary,
                  }}>
                  Units(500)
                </Typography>
              </Box>
            }>
            <Typography>ksks</Typography>
          </PageCard>
        </Grid>
      </Grid>
    </Box>
  );
};
