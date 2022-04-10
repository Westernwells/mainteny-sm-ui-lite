import {useEffect, useRef, useState} from 'react';
import Box from '@mui/material/Box';
import {ElevatorView} from 'models/elevator';
import {Widget} from 'components/Widget';
import {useFetchServiceOrdersByElevators} from 'hooks/reactQuery/useServiceOrder';
import Fade from '@mui/material/Fade';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {MultipleSelectCheckmarks} from 'components/MultipleSelectCheckmarks';
import {useAllElevators} from 'hooks/reactQuery/useElevator';
import {FilterFields} from 'components/FilterFields';
import {PageOverviewLayout} from 'components/PageOverviewLayout';
import {CustomPagination} from 'components/CustomPagination';
import {
  formatSearchParamsPageIndex,
  formatSearchParamsPageSize,
} from 'utils/utils';
import {useSearchParams} from 'react-router-dom';
import {UnitSection} from './UnitSection';
import {UnitsMapsView} from './UnitsMapsView';
import {UnitColumns} from './UnitColumns';

const pageInfo = makePage(0, 50);

export const MyUnits = () => {
  const fallback = useRef({
    elevator: createEmptyResource<ElevatorView>(10),
    centerCoord: {longitude: 0, latitude: 0},
  }).current;
  const [queryParams, setQueryParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(pageInfo);
  const [pageCount, setPageCount] = useState(0);
  const [showFilter, setShowFilter] = useState(false);
  const [availability, setAvailability] = useState<number[][]>([]);
  const [status, setStatus] = useState<string[]>([]);
  const [nextVisit, setNextVisit] = useState<string[]>([]);
  const [showMapview, setShowMapview] = useState(false);

  const {data: elevatorResponse = fallback} = useAllElevators(
    search,
    page,
    {
      status,
    },
    {keepPreviousData: true},
  );
  const {data: elevatorsByAddressList} = useFetchServiceOrdersByElevators(
    elevatorResponse.elevator,
    {nextVisit, availabilityRange: availability},
  );

  const availabilityRangeConvertor = (selectedItems: string[]) => {
    const range: number[][] = [];
    selectedItems.forEach((item) => {
      switch (item) {
        case 'Under 40%':
          range.push([0, 40]);
          // '40 - 60%', '60 - 80%', 'Above 80%'
          break;
        case '40 - 60%':
          range.push([40, 60]);

          break;
        case '60 - 80%':
          range.push([60, 80]);

          break;
        case 'Above 80%':
          range.push([80, 100]);

          break;
        default:
          break;
      }
    });
    setAvailability(range);
  };

  const openMapView = () => {
    setShowMapview(true);
  };

  const closeMapView = () => {
    setShowMapview(false);
  };

  useEffect(() => {
    const currentParams = Object.fromEntries([...queryParams]);

    setPage({
      ...page,
      pageSize: Number(currentParams.pageSize),
      pageIndex: Number(currentParams.pageIndex) - 1,
    });
  }, [queryParams]);

  useEffect(() => {
    if (elevatorsByAddressList) {
      setPageCount(Math.ceil(elevatorResponse.elevator.total / page.pageSize));
    }
  }, [elevatorsByAddressList, page]);

  useEffect(() => {
    if (!showFilter) {
      setStatus([]);
      setNextVisit([]);
      setAvailability([]);
    }
  }, [showFilter]);
  return (
    <PageOverviewLayout
      label="Units"
      renderWidget={
        <Widget
          searchPlaceholder="Try ‘Schindler’ or ‘Mitsubishi’"
          getSearchValue={(val: string) => setSearch(val)}
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
              label="Availability"
              options={['Under 40%', '40 - 60%', '60 - 80%', 'Above 80%']}
              getSelectedValue={(item) => availabilityRangeConvertor(item)}
              multiple={false}
            />

            <MultipleSelectCheckmarks
              label="Status"
              options={['RUNNING', 'STOPPED']}
              getSelectedValue={(item) => setStatus(item)}
            />

            <MultipleSelectCheckmarks
              label="Upcoming visits"
              options={['This week', 'Next week', 'Next month']}
              getSelectedValue={(item) => setNextVisit(item)}
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
            {elevatorsByAddressList?.map((elevatorsByAddress) => (
              <UnitSection
                key={elevatorsByAddress.address.id}
                elevatorsByAddress={elevatorsByAddress}
              />
            ))}
          </Box>
          {pageCount ? (
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
              totalRows={elevatorResponse.elevator.total}
            />
          ) : null}
        </>
      ) : (
        <UnitsMapsView
          elevatorsByAddressList={elevatorsByAddressList}
          centerCoord={elevatorResponse?.centerCoord}
        />
      )}
    </PageOverviewLayout>
  );
};
