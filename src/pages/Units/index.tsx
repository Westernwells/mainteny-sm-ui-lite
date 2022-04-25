import {useEffect, useRef, useState} from 'react';
import Box from '@mui/material/Box';
import {ElevatorView} from 'models/elevator';
import {Widget} from 'components/Widget';
import * as _ from 'lodash';
import Fade from '@mui/material/Fade';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {MultipleSelectCheckmarks} from 'components/MultipleSelectCheckmarks';
import {useAllElevators} from 'hooks/reactQuery/useElevator';
import {FilterFields} from 'components/FilterFields';
import {PageOverviewLayout} from 'components/PageOverviewLayout';
import {CustomPagination} from 'components/CustomPagination';
import {Progress} from 'components/Progress';
import {EmptySection} from 'components/EmptySection';
import {
  formatSearchParamsPageIndex,
  formatSearchParamsPageSize,
} from 'utils/utils';
import {getCenter} from 'geolib';
import {Location, Resource} from 'models/misc';
import {useSearchParams} from 'react-router-dom';
import {UnitSection} from './UnitSection';
import {UnitsMapsView} from './UnitsMapsView';
import {UnitColumns} from './UnitColumns';
import {ElevatorByAddr} from './Models';

const pageInfo = makePage(0, 50);

export const MyUnits = () => {
  const fallback = useRef({
    elevatorByAddress: {} as ElevatorByAddr,
    centerCoord: {longitude: 0, latitude: 0},
  }).current;
  const [queryParams, setQueryParams] = useSearchParams();
  const [search, setSearch] = useState('');
  // const [mapSearch, setMapSearch] = useState('');
  const [page, setPage] = useState(pageInfo);
  const [pageCount, setPageCount] = useState(0);
  const [showFilter, setShowFilter] = useState(false);
  const [status, setStatus] = useState<string[]>([]);
  const [showMapview, setShowMapview] = useState(false);
  const [elevatorView, setElevatorView] = useState<{
    elevatorByAddress: ElevatorByAddr;
    centerCoord: Location;
  }>(fallback);

  const {
    data: {total: totalElevators} = createEmptyResource<ElevatorView>(10),
  } = useAllElevators('', makePage(0, 1), {
    status: [],
  });

  const {
    data: elevatorResponse = createEmptyResource<ElevatorView>(10),
    isLoading,
    isFetched,
  } = useAllElevators(
    search,
    page,
    {
      status,
    },
    {keepPreviousData: true},
  );

  const groupElevatorByAddressList = (elevatorRes?: Resource<ElevatorView>) => {
    const elevatorMap = _.groupBy(
      elevatorRes?.data,
      (elevator: ElevatorView) => elevator.address.fullName,
    );

    return elevatorMap;
  };

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

    setPage({
      ...page,
      pageSize: Number(currentParams.pageSize),
      pageIndex: Number(currentParams.pageIndex) - 1,
    });
  }, [queryParams]);

  useEffect(() => {
    if (elevatorResponse) {
      setPageCount(Math.ceil(elevatorResponse.total / page.pageSize));
    }
  }, [elevatorResponse, page]);

  useEffect(() => {
    if (!showFilter) {
      setStatus([]);
    }
  }, [showFilter]);

  if (isFetched && !totalElevators) {
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

  const openMapView = () => {
    setShowMapview(true);
  };

  const closeMapView = () => {
    setShowMapview(false);
  };

  console.log(isLoading, '>>>>>><<<<');

  if (isLoading) {
    return <Progress />;
  }

  return (
    <PageOverviewLayout
      label="Units"
      renderWidget={
        <Widget
          searchPlaceholder="Search company name, unit model"
          getSearchValue={(val: string) => {
            setSearch(val);
          }}
          openMapView={openMapView}
          closeMapView={closeMapView}
          setShowFilter={setShowFilter}
          showFilter={showFilter}
        />
      }>
      <Fade in={showFilter} unmountOnExit>
        <Box>
          <FilterFields setShowFilter={setShowFilter}>
            <MultipleSelectCheckmarks
              label="Status"
              options={['RUNNING', 'STOPPED']}
              getSelectedValue={(item) => setStatus(item)}
            />

            <MultipleSelectCheckmarks
              label="Upcoming visits"
              options={['This week', 'Next week', 'Next month']}
              getSelectedValue={() => {}}
              multiple={false}
            />
          </FilterFields>
        </Box>
      </Fade>

      {!showMapview ? (
        <>
          <UnitColumns />
          <Box
            sx={{
              flexGrow: 1,
              overflowY: 'scroll',
              height: '1px',
            }}>
            {Object.keys(elevatorView.elevatorByAddress).map((key) => (
              <UnitSection
                key={key}
                address={key}
                elevators={elevatorView.elevatorByAddress[key]}
              />
            ))}
          </Box>
          {pageCount > 1 ? (
            <CustomPagination
              pageSize={page.pageSize}
              pageIndex={page.pageIndex}
              handlePageSizeChange={(newPageSize: number) =>
                setQueryParams(
                  formatSearchParamsPageSize(newPageSize, queryParams),
                )
              }
              handlePageChange={(newPage: number) =>
                setQueryParams(
                  formatSearchParamsPageIndex(newPage, queryParams),
                )
              }
              pageCount={pageCount}
              totalRows={elevatorResponse.total}
            />
          ) : null}
        </>
      ) : (
        <UnitsMapsView
          defaultCenterCoord={elevatorView?.centerCoord}
          search={search}
          status={status}
        />
      )}
    </PageOverviewLayout>
  );
};
