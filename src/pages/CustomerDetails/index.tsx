import {useEffect, useLayoutEffect, useState} from 'react';
import {TabsBody} from 'components/TabsBody';
import {useSearchParams} from 'react-router-dom';
import {Tabs} from 'components/Tab';
import ElevatorIcon from '@mui/icons-material/Elevator';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import {formatSearchParams} from 'utils/utils';
import {useLocation} from 'react-router';
import {CustomerOverviewTab} from './Tabs/CustomerOverview';
import {ContractsTab} from './Tabs/ContractsTab';
import {UnitsTab} from './Tabs/UnitsTab';

interface Props {
  getCurrentPageTitle?: (title: string) => void;
}

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

export const CustomerDetails = ({getCurrentPageTitle}: Props) => {
  const [tabValue, setTabValue] = useState(0);
  const customerId = (useLocation().state as any).id;
  const [customerName, setCustomerName] = useState('');
  const [queryParams, setQueryParams] = useSearchParams();

  useLayoutEffect(() => {
    if (getCurrentPageTitle) {
      getCurrentPageTitle(customerName);
    }
  }, [customerName]);

  useEffect(() => {
    const currentParams = Object.fromEntries([...queryParams]);
    setTabValue(Number(currentParams.tab));
  }, []);

  return (
    <Tabs
      tabItems={tabItems}
      currentIndex={tabValue}
      onChange={(index) => {
        setQueryParams(
          formatSearchParams({tab: index.toString()}, queryParams),
        );
        setTabValue(index);
      }}
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
