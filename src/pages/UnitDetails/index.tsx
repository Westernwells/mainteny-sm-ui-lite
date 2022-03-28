import {useState} from 'react';
import {Tabs} from 'components/Tab';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import {TabsBody} from 'components/TabsBody';
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

// TODO: enable the rule again
// eslint-disable-next-line
export const UnitsDetail = () => {
  const [value, setValue] = useState(0);

  return (
    <Tabs tabItems={tabItems} getCurrentTabIndex={(index) => setValue(index)}>
      <TabsBody value={value} index={0}>
        <OverviewTab
          getServiceHistoryTabIndex={(tabIndex: number) => setValue(tabIndex)}
        />
      </TabsBody>

      <TabsBody value={value} index={1}>
        <ServiceHistoryTab />
      </TabsBody>
    </Tabs>
  );
};
