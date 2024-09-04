import {useTranslation} from 'react-i18next';
import {TabsBody} from 'components/TabsBody';
import Tabs from 'components/Tabs';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import {useQueryState} from 'hooks/useQueryState';
import {ArticleListDataGrid} from './Tabs/ArticleListDataGrid';
import PageContainer from '../../components/PageContainer';
import Suppliers from './Tabs/Suppliers';

export const Articles = () => {
  const {t} = useTranslation();
  const [tabValue, setTabValue] = useQueryState('tab', {
    defaultValue: 0,
    reset: true,
    parserOptions: {parseNumbers: true},
  });

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
    <PageContainer gap={4}>
      <Tabs
        tabItems={tabItems}
        currentIndex={tabValue}
        onChange={(index) => setTabValue(index)}
      />
      <TabsBody value={tabValue} index={0}>
        <ArticleListDataGrid />
      </TabsBody>
      <TabsBody value={tabValue} index={1}>
        <Suppliers />
      </TabsBody>
    </PageContainer>
  );
};

export default Articles;
