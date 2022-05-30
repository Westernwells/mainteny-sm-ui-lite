import {useState} from 'react';
import {TabsBody} from 'components/TabsBody';
import {Tabs} from 'components/Tab';
import AutoAwesomeMosaicIcon from '@mui/icons-material/AutoAwesomeMosaic';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';

const tabItems = [
  {
    label: 'Packages',
    icon: <AutoAwesomeMosaicIcon />,
  },
  {
    label: 'Articles',
    icon: <HomeRepairServiceIcon />,
  },
];

export const Articles = () => {
  const [tabValue, setTabValue] = useState(0);

  return (
    <Tabs
      hideBackIcon
      tabItems={tabItems}
      currentIndex={tabValue}
      onChange={(index) => {
        setTabValue(index);
      }}
      pageTitle="Articles & Packages">
      <TabsBody value={tabValue} index={0}>
        {null}
      </TabsBody>
      <TabsBody value={tabValue} index={1}>
        {null}
      </TabsBody>
    </Tabs>
  );
};
