import React, {useEffect, useState} from 'react';
import {Box} from '@mui/material';
import {useSearchParams, useParams} from 'react-router-dom';
import ElevatorIcon from '@mui/icons-material/Elevator';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import {Tabs} from 'components/Tab';
import {TabsBody} from 'components/TabsBody';
import {formatSearchParams} from 'utils/utils';

import {CustomerOverviewTab} from './Tabs/CustomerOverview';
import {ContractsTab} from './Tabs/ContractsTab';
import {UnitsTab} from './Tabs/UnitsTab';
import {CustomPricesTab} from './Tabs/CustomPricesTab';

interface Props {
  getCurrentPageTitle?: (title: string) => void;
}

const tabConfig = [
  {
    label: 'Overview',
    icon: <ManageSearchIcon />,
    component: (
      customerId: string,
      setCustomerName: (name: string) => void,
    ) => (
      <CustomerOverviewTab
        customerId={customerId}
        getCustomerName={setCustomerName}
      />
    ),
  },
  {
    label: 'Units',
    icon: <ElevatorIcon />,
    component: (customerId: string) => <UnitsTab customerId={customerId} />,
  },
  {
    label: 'Contracts',
    icon: <FileCopyIcon />,
    component: (customerId: string) => <ContractsTab customerId={customerId} />,
  },
  {
    label: 'Custom prices',
    icon: <ReceiptLongIcon />,
    component: (customerId: string) => (
      <CustomPricesTab propertyOwnerId={customerId} />
    ),
  },
];

export const CustomerDetails = ({getCurrentPageTitle}: Props) => {
  const {id: customerId = ''} = useParams();
  const [queryParams, setQueryParams] = useSearchParams();
  const [customerName, setCustomerName] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const currentParams = Object.fromEntries([...queryParams]);
    if (currentParams.tab) {
      setTabValue(Number(currentParams.tab));
    }

    if (getCurrentPageTitle) {
      getCurrentPageTitle(customerName);
    }
  }, [customerName]);

  const handleTabChange = (index: number) => {
    setQueryParams(formatSearchParams({tab: index.toString()}, queryParams));
    setTabValue(index);
  };

  return (
    <Box
      display="flex"
      flex={1}
      justifyContent="space-between"
      sx={{background: 'inherit'}}>
      <Tabs
        tabItems={tabConfig.map(({label, icon}) => ({label, icon}))}
        currentIndex={tabValue}
        onChange={handleTabChange}
        backBtnLabel={customerName}
        showMenuActionBtn
        hideDivider
        tabStyle={{background: 'white', mb: '20px', px: '48px'}}>
        {tabConfig.map((tab, index) => (
          <TabsBody
            key={tab.label}
            value={tabValue}
            index={index}
            containerStyle={{margin: '0 auto', width: '95%'}}>
            {tab.component(customerId, setCustomerName)}
          </TabsBody>
        ))}
      </Tabs>
    </Box>
  );
};

export default CustomerDetails;
