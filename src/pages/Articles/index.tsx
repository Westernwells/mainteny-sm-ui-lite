import {useState} from 'react';
import {TabsBody} from 'components/TabsBody';
import {Tabs} from 'components/Tab';
import AutoAwesomeMosaicIcon from '@mui/icons-material/AutoAwesomeMosaic';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';

const tabItems = [
  {
    label: 'Articles',
    icon: <HomeRepairServiceIcon />,
  },
  {
    label: 'Packages',
    icon: <AutoAwesomeMosaicIcon />,
  },
];

export const Articles = () => {
  const [tabValue, setTabValue] = useState(0);
  const [showPackageFilter, setShowPackageListFilter] = useState(false);
  const [packageListSearch, setPackageListSearch] = useState('');

  return (
    <Tabs
      showActionBtn
      btnLabel={tabValue === 0 ? 'New article' : 'New package'}
      tabItems={tabItems}
      currentIndex={tabValue}
      onChange={(index) => {
        setTabValue(index);
      }}>
      <TabsBody value={tabValue} index={0}>
        {null}
      </TabsBody>
      <TabsBody value={tabValue} index={1}>
        <PackageList searchQuery={packageListSearch} />
      </TabsBody>
    </Tabs>
  );
};
