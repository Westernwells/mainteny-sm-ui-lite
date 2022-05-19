import {useEffect, useState} from 'react';
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
import {Progress} from 'components/Progress';
import {TabContentContainer} from 'components/TabContentContainer';

import {PageCard} from 'components/PageCard';
import {SearchInput} from 'components/SearchInput';
import {OverviewUnitsCard} from './OverviewUnitsCard';
import {OverviewContractsCard} from './OverviewContractsCard';

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
  name: BasicDetailsValue;
  phone: BasicDetailsValue;
  startDate: BasicDetailsValue;
  address: BasicDetailsValue;
  email: BasicDetailsValue;
}

export const CustomerOverviewTab = ({
  customerId,
  getCustomerName,
  getCurrentTabIndex,
}: Props) => {
  const theme = useTheme();
  const {data: customer, isLoading} = useGetCustomer(customerId);
  const [basicDetails, setBasicDetails] = useState<BasicDetails>();
  const [unitQuery, setUnitQuery] = useState('');
  const [contractQuery, setContractQuery] = useState('');
  const [totalUnits, setTotalUnits] = useState(0);
  const [totalContracts, setTotalContracts] = useState(0);

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
      minHeight="11rem"
      headerStyles={{pb: '0'}}
      bodyContainerStyle={{height: '9rem'}}
      header={<Typography variant="subtitle1">Basic Details</Typography>}>
      <Box display="flex" flexWrap="wrap" mt="-1em">
        {basicDetails &&
          Object.keys(basicDetails).map((item, index) => (
            <CardProps
              key={index}
              label={basicDetails[item as keyof BasicDetails].label}
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

  if (isLoading) {
    return <Progress />;
  }

  return (
    <TabContentContainer>
      {renderBasicDetails()}
      <Grid container spacing={2} sx={{mt: '1em'}}>
        <Grid item xs={6}>
          <PageCard
            minHeight="5vh"
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
                  <Typography
                    variant="subtitle1"
                    color="textSecondary"
                    ml="0.3em">
                    ({totalUnits})
                  </Typography>
                </Box>
                <SearchInput
                  size="small"
                  placeholder="Search"
                  onValueChanged={(value) => setUnitQuery(value)}
                  containerStyle={{
                    background: theme.palette.inputBackground.main,
                    width: '12rem',
                  }}
                />
              </Box>
            }>
            <OverviewUnitsCard
              getTotalUnits={(val) => setTotalUnits(val)}
              customerId={customerId}
              query={unitQuery}
            />
            {totalUnits > 3 ? (
              <Box
                sx={{textAlign: 'center', cursor: 'pointer'}}
                onClick={() => getCurrentTabIndex && getCurrentTabIndex(1)}>
                <Typography variant="caption" color={theme.palette.info.main}>
                  see more
                </Typography>
              </Box>
            ) : null}
          </PageCard>
        </Grid>

        <Grid item xs={6}>
          <PageCard
            minHeight="5vh"
            customHeader={
              <Box display="flex" justifyContent="space-between">
                <Box display="flex">
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: theme.palette.text.primary,
                    }}>
                    Contracts
                  </Typography>
                  <Typography variant="subtitle1" color="textSecondary">
                    ({totalContracts})
                  </Typography>
                </Box>
                <SearchInput
                  size="small"
                  onValueChanged={(value) => setContractQuery(value)}
                  placeholder="Search"
                  containerStyle={{
                    background: theme.palette.inputBackground.main,
                    width: '12rem',
                  }}
                />
              </Box>
            }>
            <OverviewContractsCard
              getTotalContracts={(val) => setTotalContracts(val)}
              customerId={customerId}
              query={contractQuery}
            />
            {totalUnits > 3 ? (
              <Box
                sx={{textAlign: 'center', cursor: 'pointer'}}
                onClick={() => getCurrentTabIndex && getCurrentTabIndex(2)}>
                <Typography variant="caption" color={theme.palette.info.main}>
                  see more
                </Typography>
              </Box>
            ) : null}
          </PageCard>
        </Grid>
      </Grid>
    </TabContentContainer>
  );
};
