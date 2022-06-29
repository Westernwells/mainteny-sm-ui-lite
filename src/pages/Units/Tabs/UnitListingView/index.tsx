import {useCallback, useEffect, useRef, useState} from 'react';
import {ElevatorView} from 'models/elevator';
import {Widget} from 'components/Widget';
import {GridRowsProp, GridSortModel} from '@mui/x-data-grid';
import {DataGridLayout} from 'components/DataGridLayout';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {useAllElevators} from 'hooks/reactQuery/useElevator';
import {FilterFields} from 'components/FilterFields';
import {Progress} from 'components/Progress';
import {EmptySection} from 'components/EmptySection';
import {ServiceOrderOrderField} from 'models/service-order';
import {DatePicker} from 'components/DatePicker';
import {Order} from 'models/misc';
import {formatDate} from 'utils/datetime';
import {
  formatSearchParamsPageIndex,
  formatSearchParamsPageSize,
} from 'utils/utils';
import {useSearchParams} from 'react-router-dom';
import {FlexContainer} from 'components/FlexContainer';
import Box from '@mui/material/Box';
import {columns, makeRows} from './UnitsDataGridProps';

const pageInfo = makePage(0, 50);

export const UnitListingView = () => {
  const [queryParams, setQueryParams] = useSearchParams();
  const [lastVisitStart, setLastVisitStart] = useState<Date | null>(null);
  const [lastVisitEnd, setLastVisitEnd] = useState<Date | null>(null);
  const [nextVisitStart, setNextVisitStart] = useState<Date | null>(null);
  const [nextVisitEnd, setNextVisitEnd] = useState<Date | null>(null);
  const [sortOrder, setSortOrder] = useState<Order | undefined>();
  const [orderBy, setOrderBy] = useState<ServiceOrderOrderField | undefined>();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(pageInfo);
  const totalUnitsRef = useRef(0);
  const [pageCount, setPageCount] = useState(0);
  const [rows, setRows] = useState<GridRowsProp>([]);

  const {
    data: elevatorResponse = createEmptyResource<ElevatorView>(10),
    isLoading,
    isFetched,
    isFetching,
  } = useAllElevators(
    {
      query: search,
      pageIndex: page.pageIndex,
      pageSize: page.pageSize,
      ...(lastVisitStart && {
        lastVisitDateStart: formatDate(lastVisitStart, 'yyyy-MM-dd'),
      }),
      ...(lastVisitEnd && {
        lastVisitDateEnd: formatDate(lastVisitEnd, 'yyyy-MM-dd'),
      }),
      ...(nextVisitStart && {
        nextVisitDateStart: formatDate(nextVisitStart, 'yyyy-MM-dd'),
      }),
      ...(nextVisitEnd && {
        nextVisitDateEnd: formatDate(nextVisitEnd, 'yyyy-MM-dd'),
      }),
      ...(sortOrder && {order: sortOrder}),
      ...(orderBy && {orderBy}),
    },
    {keepPreviousData: true},
  );
  // set this value only once
  totalUnitsRef.current = totalUnitsRef.current || elevatorResponse.total;

  useEffect(() => {
    if (!isLoading) {
      setRows(makeRows(elevatorResponse.data));
    }
  }, [elevatorResponse, isLoading]);

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

  const handleSortModelChange = useCallback((sortModel: GridSortModel) => {
    // Here you save the data you need from the sort model
    setSortOrder(sortModel[0].sort?.toUpperCase() as Order);
    setOrderBy(sortModel[0].field as ServiceOrderOrderField);
  }, []);

  const clearFilters = () => {
    setLastVisitStart(null);
    setLastVisitEnd(null);
    setNextVisitStart(null);
    setNextVisitEnd(null);
  };

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
    <FilterFields onClear={() => clearFilters()} wrapperStyle={{width: '90%'}}>
      <DatePicker
        defaultDate={lastVisitStart}
        containerStyles={{mr: '1em'}}
        getSelectedDate={(date) => setLastVisitStart(date)}
        textFieldProps={{
          label: 'Last Visit Start',
        }}
      />
      <DatePicker
        defaultDate={lastVisitEnd}
        containerStyles={{mr: '1em'}}
        getSelectedDate={(date) => setLastVisitEnd(date)}
        textFieldProps={{
          label: 'Last Visit End',
        }}
      />

      <DatePicker
        defaultDate={nextVisitStart}
        containerStyles={{mr: '1em'}}
        getSelectedDate={(date) => setNextVisitStart(date)}
        textFieldProps={{
          label: 'Next Visit Start',
        }}
      />
      <DatePicker
        defaultDate={nextVisitEnd}
        containerStyles={{mr: '1em'}}
        getSelectedDate={(date) => setNextVisitEnd(date)}
        textFieldProps={{
          label: 'Next Visit End',
        }}
      />
    </FilterFields>
  );

  const renderWidget = () => (
    <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
      <Widget
        searchPlaceholder="Search by number, model, customer, address etc."
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
        onSortModelChange={handleSortModelChange}
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
