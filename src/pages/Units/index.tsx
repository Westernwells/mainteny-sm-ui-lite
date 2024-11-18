import ViewListIcon from '@mui/icons-material/ViewList';
import MapIcon from '@mui/icons-material/Map';

import {useNavigate} from 'react-router-dom';
import {useQueryState} from 'hooks/useQueryState';
import Tabs from 'components/Tabs';
import {TabsBody} from 'components/TabsBody';
import TabsWrapper from 'components/TabsWrapper';
import PageContainer from 'components/PageContainer';
import {UnitListingView} from './Tabs/UnitListingView';
import {UnitMapsView} from './Tabs/UnitMapView';

const tabItems = [
  {
    label: 'List View',
    icon: <ViewListIcon />,
  },
  {
    label: 'Map View',
    icon: <MapIcon />,
  },
];

export const MyUnits = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useQueryState('tab', {
    defaultValue: 0,
    reset: true,
    parserOptions: {parseNumbers: true},
  });

  const onClickNewUnitBtn = () => {
    navigate('new');
  };

  return (
    <PageContainer gap={3}>
      <TabsWrapper
        hideBackIcon
        tabItems={tabItems}
        showActionBtn
        btnLabel="New Unit"
        btnOnClick={onClickNewUnitBtn}
        currentIndex={tabValue}
        pageTitle="Units"
        onChange={(index) => setTabValue(index)}
        shouldWrap={tabValue === 1}>
        {tabValue === 0 && (
          <Tabs
            tabItems={tabItems}
            currentIndex={tabValue}
            onChange={(index) => setTabValue(index)}
          />
        )}
        <TabsBody value={tabValue} index={0}>
          <UnitListingView />
        </TabsBody>
        <TabsBody value={tabValue} index={1}>
          <UnitMapsView />
        </TabsBody>
      </TabsWrapper>
    </PageContainer>
  );
};

export default MyUnits;
