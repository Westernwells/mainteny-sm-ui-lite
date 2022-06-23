import {useState} from 'react';
import {useNavigate} from 'react-router';
import {TabsBody} from 'components/TabsBody';
import {Tabs} from 'components/Tab';
import AutoAwesomeMosaicIcon from '@mui/icons-material/AutoAwesomeMosaic';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
import {ArticleListDataGrid} from './Tabs/ArticleListDataGrid';

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
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);

  return (
    <Tabs
      showActionBtn
      btnLabel={tabValue === 0 ? 'New article' : 'New package'}
      btnOnClick={() =>
        tabValue === 0 ? navigate('new') : navigate('newPackage')
      }
      tabItems={tabItems}
      currentIndex={tabValue}
      onChange={(index) => {
        setTabValue(index);
      }}>
      <TabsBody value={tabValue} index={0}>
        <ArticleListDataGrid />
      </TabsBody>
      <TabsBody value={tabValue} index={1}>
        {null}
      </TabsBody>
    </Tabs>
  );
};
