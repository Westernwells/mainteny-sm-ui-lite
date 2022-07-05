import {useState} from 'react';
import {useNavigate} from 'react-router';
import {useTranslation} from 'react-i18next';
import {TabsBody} from 'components/TabsBody';
import {Tabs} from 'components/Tab';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
import {ArticleListDataGrid} from './Tabs/ArticleListDataGrid';

export const Articles = () => {
  const navigate = useNavigate();
  const {t} = useTranslation();
  const [tabValue, setTabValue] = useState(0);

  const tabItems = [
    {
      label: t('Articles'),
      icon: <HomeRepairServiceIcon />,
    },
    // {
    //   label: t('Packages'),
    //   icon: <AutoAwesomeMosaicIcon />,
    // },
  ];

  return (
    <Tabs
      showActionBtn
      btnLabel={tabValue === 0 ? t('New Article') : t('New Package')}
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
