import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {TabsBody} from 'components/TabsBody';
import {Tabs} from 'components/Tab';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import {ArticleListDataGrid} from './Tabs/ArticleListDataGrid';
import {SupplierListDataGrid} from './Tabs/SupplierListDataGrid';

export const Articles = () => {
  const navigate = useNavigate();
  const {t} = useTranslation();
  const [tabValue, setTabValue] = useState(0);

  const tabItems = [
    {
      label: t('Articles'),
      icon: <HomeRepairServiceIcon />,
    },
    {
      label: t('Suppliers'),
      icon: <LocalShippingIcon />,
    },
  ];

  return (
    <Tabs
      showActionBtn
      btnLabel={tabValue === 0 ? t('New Article') : t('New Supplier')}
      btnOnClick={() =>
        tabValue === 0 ? navigate('new') : navigate('newSupplier')
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
        <SupplierListDataGrid />
      </TabsBody>
    </Tabs>
  );
};

export default Articles;
