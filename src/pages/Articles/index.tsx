import {useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {TabsBody} from 'components/TabsBody';
import {Tabs} from 'components/Tab';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import {formatSearchParams} from 'utils/utils';
import {ArticleListDataGrid} from './Tabs/ArticleListDataGrid';
import {SupplierListDataGrid} from './Tabs/SupplierListDataGrid';

export const Articles = () => {
  const navigate = useNavigate();
  const [queryParams, setQueryParams] = useSearchParams();
  const {t} = useTranslation();
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const currentParams = Object.fromEntries([...queryParams]);
    if (currentParams.tab) setTabValue(Number(currentParams.tab));
  }, []);

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
        setQueryParams(
          formatSearchParams({tab: index.toString()}, queryParams),
        );
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
