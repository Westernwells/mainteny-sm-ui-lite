import {useState} from 'react';
import Box from '@mui/material/Box';
import {TabsBody} from 'components/TabsBody';
import {Tabs} from 'components/Tab';
import ElevatorIcon from '@mui/icons-material/Elevator';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import {useParams} from 'react-router';
import {OverviewTab} from './Tabs/OverviewTab';
import {ContractTab} from './Tabs/ContractTab';

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
  return (
    <Box>
      <Tabs
        tabItems={tabItems}
        getCurrentTabIndex={(index) => setTabValue(index)}>
        <TabsBody value={tabValue} index={0}>
          <OverviewTab customerId={customerId} />
        </TabsBody>
        <TabsBody value={tabValue} index={1}>
          <div />
        </TabsBody>

        <TabsBody value={tabValue} index={2}>
          <ContractTab customerId={customerId} />
        </TabsBody>
      </Tabs>
    </Box>
  );
};
