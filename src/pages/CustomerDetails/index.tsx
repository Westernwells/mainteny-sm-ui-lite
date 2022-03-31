import {useState} from 'react';
import Box from '@mui/material/Box';
import {TabsBody} from 'components/TabsBody';
import {Tabs} from 'components/Tab';
import ElevatorIcon from '@mui/icons-material/Elevator';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import {useParams} from 'react-router';
import {CustomerOverviewTab} from './Tabs/CustomerOverviewTab';
import {ContractTab} from './Tabs/ContractsTab';
import {UnitsTab} from './Tabs/UnitsTab';

const tabItems = [
  {
    label: 'Overview',
    icon: <ManageSearchIcon />,
  },
  {
    label: 'Units',
    icon: <ElevatorIcon />,
  },
  {
    label: 'Contracts',
    icon: <FileCopyIcon />,
  },
];

export const CustomerDetails = () => {
  const [tabValue, setTabValue] = useState(0);
  const {id: customerId} = useParams();
  const [customerName, setCustomerName] = useState('');
  return (
    <Box>
      <Tabs
        tabItems={tabItems}
        getCurrentTabIndex={(index) => setTabValue(index)}
        backBtnLabel={customerName}>
        <TabsBody value={tabValue} index={0}>
          <CustomerOverviewTab
            customerId={customerId}
            getCustomerName={(name) => setCustomerName(name)}
          />
        </TabsBody>
        <TabsBody value={tabValue} index={1}>
          <UnitsTab customerId={customerId} />
        </TabsBody>

        <TabsBody value={tabValue} index={2}>
          <ContractTab customerId={customerId} />
        </TabsBody>
      </Tabs>
    </Box>
  );
};
