import {useEffect, useState} from 'react';
import {TabsBody} from 'components/TabsBody';
import {useSearchParams} from 'react-router-dom';
import {Tabs} from 'components/Tab';
import ElevatorIcon from '@mui/icons-material/Elevator';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import {formatSearchParams} from 'utils/utils';
import {Widget} from 'components/Widget';
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
  const [unitSearch, setUnitSearch] = useState('');
  const [showUnitFilter, setShowUnitFiler] = useState(false);
  const [contractSearch, setContractSearch] = useState('');
  const [showContractFilter, setShowContractFiler] = useState(false);
  const [queryParams, setQueryParams] = useSearchParams();

  useEffect(() => {
    const currentParams = Object.fromEntries([...queryParams]);
    setTabValue(Number(currentParams.tab));
  }, []);

  const renderUnitWidget = () => (
    <Widget
      searchPlaceholder=""
      getSearchValue={(search) => setUnitSearch(search)}
      setShowFilter={setShowUnitFiler}
      showFilter={showUnitFilter}
      hideViewOption
    />
  );

  const renderContractWidget = () => (
    <Widget
      searchPlaceholder=""
      getSearchValue={(search) => setContractSearch(search)}
      setShowFilter={setShowContractFiler}
      showFilter={showContractFilter}
      hideViewOption
    />
  );

  const renderWidget = (tabIndex: number) => {
    switch (tabIndex) {
      case 1:
        return renderUnitWidget();
      case 2:
        return renderContractWidget();
      default:
        return null;
    }
  };

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
      renderWidget={renderWidget(tabValue)}
      backBtnLabel={customerName}>
      <TabsBody value={tabValue} index={0}>
        <CustomerOverviewTab
          customerId={customerId}
          getCustomerName={(name) => setCustomerName(name)}
          getCurrentTabIndex={(index) => setTabValue(index)}
        />
      </TabsBody>
      <TabsBody value={tabValue} index={1}>
        <UnitsTab
          customerId={customerId}
          searchQuery={unitSearch}
          showFilter={showUnitFilter}
          setShowFilter={setShowUnitFiler}
        />
      </TabsBody>
      <TabsBody value={tabValue} index={2}>
        <ContractsTab
          customerId={customerId}
          searchQuery={contractSearch}
          showFilter={showContractFilter}
          setShowFilter={setShowContractFiler}
        />
      </TabsBody>
    </Tabs>
  );
};
