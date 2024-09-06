import {useTranslation} from 'react-i18next';
import {TabsBody} from 'components/TabsBody';
import Tabs from 'components/Tabs';
import {Tabs as OldTabs} from 'components/Tab';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import {useQueryState} from 'hooks/useQueryState';
import {useNavigate} from 'react-router-dom';
import {PropsWithChildren} from 'react';
import {ArticleListDataGrid} from './Tabs/ArticleListDataGrid';
import PageContainer from '../../components/PageContainer';
import Suppliers from './Tabs/Suppliers';

type TabWrapperProps = {
  shouldWrap: boolean;
  tabValue: number;
  tabItems: {label: string; icon: JSX.Element}[];
  setTabValue: (tabValue: number) => void;
};

const TabsWrapper = ({
  tabValue,
  shouldWrap,
  tabItems,
  children,
  setTabValue,
}: PropsWithChildren<TabWrapperProps>) => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  if (!shouldWrap) return children;
  return (
    <OldTabs
      showActionBtn
      btnLabel={tabValue === 0 ? t('New Article') : t('New Supplier')}
      btnOnClick={() =>
        tabValue === 0 ? navigate('new') : navigate('newSupplier')
      }
      tabItems={tabItems}
      currentIndex={tabValue}
      onChange={(index) => setTabValue(index)}>
      {children}
    </OldTabs>
  );
};

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
    <PageContainer gap={3}>
      <TabsWrapper
        tabItems={tabItems}
        tabValue={tabValue}
        setTabValue={setTabValue}
        shouldWrap={tabValue === 0}>
        {tabValue === 1 && (
          <Tabs
            tabItems={tabItems}
            currentIndex={tabValue}
            onChange={(index) => setTabValue(index)}
          />
        )}
        <TabsBody value={tabValue} index={0}>
          <ArticleListDataGrid />
        </TabsBody>
        <TabsBody value={tabValue} index={1}>
          <Suppliers />
        </TabsBody>
      </TabsWrapper>
    </PageContainer>
  );
};

export default Articles;
