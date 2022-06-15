import {useLayoutEffect, useState} from 'react';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import ListIcon from '@mui/icons-material/ListAlt';

import {TabsBody} from 'components/TabsBody';
import {Tabs} from 'components/Tab';
import {EmptySection} from 'components/EmptySection';
import {OverviewTab} from './Tabs/OverviewTab';
import {ServiceHistoryTab} from './Tabs/ServiceHistoryTab';
import {TodosTab} from './Tabs/TodosTab';

interface Props {
  getCurrentPageTitle?: (title: string) => void;
}

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
  {
    label: "To-Do's",
    icon: <ListIcon />,
  },
];

export const UnitsDetail = ({getCurrentPageTitle}: Props) => {
  const [value, setValue] = useState(0);
  const [unitName, setUnitName] = useState('');

  useLayoutEffect(() => {
    if (getCurrentPageTitle) {
      getCurrentPageTitle(unitName);
    }
  }, [unitName]);

  return (
    <Tabs
      tabItems={tabItems}
      currentIndex={value}
      onChange={(index) => setValue(index)}>
      <TabsBody value={value} index={0}>
        <OverviewTab getUnitName={(name) => setUnitName(name)} />
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

      <TabsBody value={value} index={3}>
        <TodosTab />
      </TabsBody>
    </Tabs>
  );
};
