/* eslint-disable */
import {useEffect, useRef, useState} from 'react';
import {ElevatorByAddr, ElevatorView} from 'models/elevator';
import {Widget} from 'components/Widget';
import * as _ from 'lodash';
import {GridRowsProp} from '@mui/x-data-grid';
import {DataGridLayout} from 'components/DataGridLayout';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {MultipleSelectCheckmarks} from 'components/MultipleSelectCheckmarks';
import {useAllElevators} from 'hooks/reactQuery/useElevator';
import ToggleButton from '@mui/material/ToggleButton';
import ViewListIcon from '@mui/icons-material/ViewList';
import GridViewIcon from '@mui/icons-material/GridView';
import {FilterFields} from 'components/FilterFields';
import {PageListingLayout} from 'components/PageListingLayout';
import {Progress} from 'components/Progress';
import {EmptySection} from 'components/EmptySection';
import {
  formatSearchParams,
  formatSearchParamsPageIndex,
  formatSearchParamsPageSize,
} from 'utils/utils';
import {getCenter} from 'geolib';
import {Location, Resource} from 'models/misc';
import {useNavigate, useSearchParams} from 'react-router-dom';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Box from '@mui/material/Box';
import {columns, makeRows} from './UnitsDataGridProps';
import {DataGridElevatorView} from './Models';
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
    icon: <GridViewIcon />,
  },
];

export const MyUnits = () => {
  const [tabValue, setTabValue] = useState(0);
  const [queryParams, setQueryParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const currentParams = Object.fromEntries([...queryParams]);
    setTabValue(Number(currentParams.tab));
  }, []);

  return (
    <Tabs
      hideBackIcon
      tabItems={tabItems}
      showActionBtn
      btnLabel="New Order"
      currentIndex={tabValue}
      pageTitle="Service Orders"
      onChange={(index) => {
        setQueryParams(
          formatSearchParams({tab: index.toString()}, queryParams),
        );
        setTabValue(index);
      }}>
      <TabsBody value={tabValue} index={0}>
        {<UnitListingView />}
      </TabsBody>
      <TabsBody value={tabValue} index={1}>
        {<UnitMapsView />}
      </TabsBody>
    </Tabs>
  );
};
