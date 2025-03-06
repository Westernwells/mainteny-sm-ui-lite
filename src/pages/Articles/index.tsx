import React from 'react';
import {Box} from '@mui/material';
import {useTranslation} from 'react-i18next';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import FolderIcon from '@mui/icons-material/Folder';
import {Tabs} from 'components/Tab';
import {TabsBody} from 'components/TabsBody';
import {useQueryState} from 'hooks/useQueryState';
import ArticleList from 'pages/Articles/Tabs/ArticleList';
import {getBackButtonTitle} from 'utils/article-utils';
import Suppliers from './Tabs/Suppliers';
import MixedPositions from './Tabs/MixedPositions';

export const Articles = () => {
  const {t} = useTranslation();
  const [tabValue, setTabValue] = useQueryState('tab', {
    defaultValue: 0,
    reset: true,
    parserOptions: {parseNumbers: true},
  });

  const tabConfig = [
    {
      label: t('Articles'),
      icon: <HomeRepairServiceIcon />,
      component: <ArticleList />,
    },
    {
      label: t('Mixed Positions'),
      icon: <FolderIcon />,
      component: <MixedPositions />,
    },
    {
      label: t('Suppliers'),
      icon: <LocalShippingIcon />,
      component: <Suppliers />,
    },
  ];

  const handleTabChange = (index: number) => {
    setTabValue(index);
  };

  return (
    <Box
      display="flex"
      flex={1}
      justifyContent="space-between"
      sx={{background: 'inherit'}}>
      <Tabs
        tabItems={tabConfig.map(({label, icon}) => ({label, icon}))}
        currentIndex={tabValue}
        onChange={handleTabChange}
        showMenuActionBtn
        backBtnLabel={t(getBackButtonTitle(tabValue))}
        tabStyle={{
          background: 'white',
          mb: '20px',
          px: '48px',
        }}
        hideDivider>
        {tabConfig.map((tab, index) => (
          <TabsBody
            key={tab.label}
            value={tabValue}
            index={index}
            containerStyle={{
              margin: '0 auto',
              width: '95%',
              background: index === 1 ? 'inherit' : 'white',
              padding: '24px',
            }}>
            {tab.component}
          </TabsBody>
        ))}
      </Tabs>
    </Box>
  );
};

export default Articles;
