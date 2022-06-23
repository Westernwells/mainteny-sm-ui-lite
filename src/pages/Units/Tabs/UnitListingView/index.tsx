import {useEffect, useRef, useState} from 'react';
import {ElevatorByAddr, ElevatorView} from 'models/elevator';
import {Widget} from 'components/Widget';
import * as _ from 'lodash';
import {GridRowsProp} from '@mui/x-data-grid';
import {DataGridLayout} from 'components/DataGridLayout';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {MultipleSelectCheckmarks} from 'components/MultipleSelectCheckmarks';
import {useAllElevators} from 'hooks/reactQuery/useElevator';
import {FilterFields} from 'components/FilterFields';
import {Progress} from 'components/Progress';
import {EmptySection} from 'components/EmptySection';
import {
  formatSearchParamsPageIndex,
  formatSearchParamsPageSize,
} from 'utils/utils';
import {getCenter} from 'geolib';
import {Location, Resource} from 'models/misc';
import {useSearchParams} from 'react-router-dom';
import {FlexContainer} from 'components/FlexContainer';
import Box from '@mui/material/Box';
import {columns, makeRows} from './UnitsDataGridProps';
import {DataGridElevatorView} from '../../Models';

const pageInfo = makePage(0, 50);

export const UnitListingView = () => {
  const fallback = useRef({
    elevatorByAddress: {} as ElevatorByAddr,
    centerCoord: {longitude: 0, latitude: 0},
  }).current;
  const [queryParams, setQueryParams] = useSearchParams();
  const [upcomingVisitFilter, setUpcomingVisitFilter] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(pageInfo);
  const totalUnitsRef = useRef(0);
  const [pageCount, setPageCount] = useState(0);
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [status, setStatus] = useState<string[]>([]);
  const [elevatorView, setElevatorView] = useState<{
    elevatorByAddress: ElevatorByAddr;
    centerCoord: Location;
  }>(fallback);

  const {
    data: elevatorResponse = createEmptyResource<ElevatorView>(10),
    isLoading,
    isFetched,
    isFetching,
  } = useAllElevators(search, page, {status}, {keepPreviousData: true});
  // set this value only once
  totalUnitsRef.current = totalUnitsRef.current || elevatorResponse.total;

  const groupElevatorByAddressList = (elevatorRes?: Resource<ElevatorView>) => {
    const elevatorMap = _.groupBy(
      elevatorRes?.data,
      (elevator: ElevatorView) => elevator.address.fullName,
    );

    return elevatorMap;
  };

  const flatenn = (elevators: {[key: string]: ElevatorView[]}) => {
    let prevAdddressId = '';
    const flatArray: DataGridElevatorView[] = [];
    Object.keys(elevators).forEach((key) => {
      elevators[key].forEach((elevator) => {
        const {address} = elevator;
        const showAddress = address.id !== prevAdddressId;
        flatArray.push({showAddress, ...elevator});
        prevAdddressId = address.id;
      });
    });
    return flatArray;
  };

  useEffect(() => {
    if (elevatorView.elevatorByAddress) {
      const flatArr = flatenn(elevatorView.elevatorByAddress);
      setRows(
        makeRows({
          elevators: flatArr,
        }),
      );
    } else {
      setRows([]);
    }
  }, [elevatorView]);

  useEffect(() => {
    if (!isLoading) {
      const latLng = elevatorResponse?.data.map((elevator: ElevatorView) => ({
        latitude: elevator.address.location.latitude,
        longitude: elevator.address.location.longitude,
      }));
      const centerCoord = getCenter(latLng) as unknown as Location;
      const result = groupElevatorByAddressList(elevatorResponse);

      setElevatorView({
        elevatorByAddress: result,
        centerCoord,
      });
    }
  }, [isLoading, elevatorResponse]);

  useEffect(() => {
    const currentParams = Object.fromEntries([...queryParams]);
    if (currentParams.pageSize)
      setPage({
        ...page,
        pageSize: Number(currentParams.pageSize),
      });
    if (currentParams.pageIndex)
      setPage({
        ...page,
        pageIndex: Number(currentParams.pageIndex) - 1,
      });
  }, [queryParams]);

  useEffect(() => {
    if (elevatorResponse) {
      setPageCount(Math.ceil(elevatorResponse.total / page.pageSize));
    }
  }, [elevatorResponse, page]);

  if (isFetched && !totalUnitsRef.current) {
    return (
      <EmptySection
        label="No elevators have been created yet. Please click the button below to create one!"
        showActionBtn
        btnLabel="Add Elevator"
        containerStyle={{
          height: '100%',
          mb: '10em',
        }}
      />
    );
  }

  const renderFilterItems = () => (
    <FilterFields
      onClear={() => {
        setStatus([]);
        setUpcomingVisitFilter([]);
      }}>
      <MultipleSelectCheckmarks
        label="Upcoming visits"
        options={['This week', 'Next week', 'Next month']}
        initialSelectedItems={upcomingVisitFilter}
        getSelectedValue={(val) => setUpcomingVisitFilter(val)}
        multiple={false}
      />
    </FilterFields>
  );

  const renderWidget = () => (
    <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
      <Widget
        searchPlaceholder="Search order type, customer, address etc."
        getSearchValue={(val) => setSearch(val)}
        filterItems={renderFilterItems()}
      />
    </Box>
  );

  if (isLoading) {
    return <Progress />;
  }

  return (
    <FlexContainer>
      {renderWidget()}
      <DataGridLayout
        hideFooter={pageCount <= 1}
        rows={rows}
        columns={columns}
        loading={isFetching}
        pageSize={page.pageSize}
        pageIndex={page.pageIndex + 1}
        handlePageSizeChange={(newPageSize: number) =>
          setQueryParams(formatSearchParamsPageSize(newPageSize, queryParams))
        }
        handlePageChange={(newPage: number) =>
          setQueryParams(formatSearchParamsPageIndex(newPage, queryParams))
        }
        pageCount={pageCount}
        totalRows={elevatorResponse.total}
      />
    </FlexContainer>
  );
};
