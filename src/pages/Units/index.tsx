import ViewListIcon from '@mui/icons-material/ViewList';
import MapIcon from '@mui/icons-material/Map';

import {useNavigate} from 'react-router-dom';
import {Mixpanel} from 'mixpanel/mixpanel';
import {mixpanelEvents} from 'mixpanel/constants';
import {useQueryState} from 'hooks/useQueryState';
import {Tabs} from 'components/Tab';
import {TabsBody} from 'components/TabsBody';
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
    Mixpanel.identifyAndTrack(mixpanelEvents.NEW_UNIT_BUTTON_CLICKED);
    navigate('new');
  };

  return (
    <Tabs
      hideBackIcon
      tabItems={tabItems}
      showActionBtn
      btnLabel="New Unit"
      btnOnClick={onClickNewUnitBtn}
      currentIndex={tabValue}
      pageTitle="Service Jobs"
      onChange={(index) => setTabValue(index)}>
      <TabsBody value={tabValue} index={0}>
        <UnitListingView />
      </TabsBody>
      <TabsBody value={tabValue} index={1}>
        <UnitMapsView />
      </TabsBody>
    </Tabs>
  );
};

export default MyUnits;
