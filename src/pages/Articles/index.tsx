import {useState} from 'react';
import {TabsBody} from 'components/TabsBody';
import {Tabs} from 'components/Tab';
import AutoAwesomeMosaicIcon from '@mui/icons-material/AutoAwesomeMosaic';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
import {Widget} from 'components/Widget';

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

  const renderArticleListWidget = () => (
    <Widget
      searchPlaceholder=""
      setShowFilter={() => {}}
      showFilter={false}
      btnLabel="New Article"
      showActionBtn
      hideViewOption
    />
  );

  const renderPackageListWidget = () => (
    <Widget
      searchPlaceholder=""
      setShowFilter={() => {}}
      showFilter={false}
      btnLabel="New Package"
      showActionBtn
      hideViewOption
    />
  );

  const renderWidget = (tabIndex: number) => {
    switch (tabIndex) {
      case 0:
        return renderPackageListWidget();
      case 1:
        return renderArticleListWidget();
      default:
        return renderPackageListWidget();
    }
  };

  return (
    <Tabs
      hideBackIcon
      tabItems={tabItems}
      currentIndex={tabValue}
      onChange={(index) => {
        setTabValue(index);
      }}
      pageTitle="Articles & Packages"
      renderWidget={renderWidget(tabValue)}>
      <TabsBody value={tabValue} index={0}>
        {null}
      </TabsBody>
      <TabsBody value={tabValue} index={1}>
        {null}
      </TabsBody>
    </Tabs>
  );
};
