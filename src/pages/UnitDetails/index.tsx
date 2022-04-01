import {useState} from 'react';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';

import {TabsBody} from 'components/TabsBody';
import {Tabs} from 'components/Tab';
import {EmptySection} from 'components/EmptySection';
import {OverviewTab} from './Tabs/OverviewTab';
import {ServiceHistoryTab} from './Tabs/ServiceHistoryTab';

const tabItems = [
  {
    label: 'Overview',
    icon: <ManageSearchIcon />,
  },
  {
    label: 'Service History',
    icon: <EngineeringOutlinedIcon />,
  },
  {
    label: 'Performance',
    icon: <GraphicEqIcon />,
  },
];

export const UnitsDetail = () => {
  const [value, setValue] = useState(0);
  const [customerName, setCustomerName] = useState('');

  return (
    <Tabs
      tabItems={tabItems}
      getCurrentTabIndex={(index) => setValue(index)}
      backBtnLabel={customerName}>
      <TabsBody value={value} index={0}>
        <OverviewTab
          getServiceHistoryTabIndex={(tabIndex: number) => setValue(tabIndex)}
          getCustomerName={(name) => setCustomerName(name)}
        />
      </TabsBody>

      <TabsBody value={value} index={1}>
        <ServiceHistoryTab />
      </TabsBody>

      <TabsBody value={value} index={2}>
        <EmptySection
          label="Data will be available here only for IoT enabled elevators!"
          size="large"
          containerStyle={{mt: 12}}
        />
      </TabsBody>
    </Tabs>
  );
};
