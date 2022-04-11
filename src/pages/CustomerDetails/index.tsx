import {useState} from 'react';
import {TabsBody} from 'components/TabsBody';
import {Tabs} from 'components/Tab';
import ElevatorIcon from '@mui/icons-material/Elevator';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import {useParams} from 'react-router';
import {CustomerOverviewTab} from './Tabs/CustomerOverview';
import {ContractsTab} from './Tabs/ContractsTab';
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
    <Tabs
      tabItems={tabItems}
      currentIndex={tabValue}
      onChange={(index) => setTabValue(index)}
      backBtnLabel={customerName}>
      <TabsBody value={tabValue} index={0}>
        <CustomerOverviewTab
          customerId={customerId}
          getCustomerName={(name) => setCustomerName(name)}
          getCurrentTabIndex={(index) => setTabValue(index)}
        />
      </TabsBody>
      <TabsBody value={tabValue} index={1}>
        <UnitsTab customerId={customerId} />
      </TabsBody>
      <TabsBody value={tabValue} index={2}>
        <ContractsTab customerId={customerId} />
      </TabsBody>
    </Tabs>
  );
};
