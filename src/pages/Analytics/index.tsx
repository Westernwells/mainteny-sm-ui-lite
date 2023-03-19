import {useState} from 'react';
import ContentPaste from '@mui/icons-material/ContentPaste';
import {TabsBody} from 'components/TabsBody';
import {Tabs} from 'components/Tab';
import {Reports} from './Tabs/Reports';

export const Analytics = () => {
  const [tabValue, setTabValue] = useState(0);

  const tabItems = [
    {
      label: 'Reports',
      icon: <ContentPaste />,
    },
  ];

  return (
    <Tabs
      tabItems={tabItems}
      currentIndex={tabValue}
      onChange={(index) => {
        setTabValue(index);
      }}>
      <TabsBody value={tabValue} index={0}>
        <Reports />
      </TabsBody>
    </Tabs>
  );
};

export default Analytics;
