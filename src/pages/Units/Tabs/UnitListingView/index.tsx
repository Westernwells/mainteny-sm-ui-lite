import {useEffect, useRef, useState} from 'react';
import {ElevatorOrderField, ElevatorView} from 'models/elevator';
import {Widget} from 'components/Widget';
import {GridRowsProp} from '@mui/x-data-grid';
import {DataGridLayout} from 'components/DataGridLayout';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {useAllElevators} from 'hooks/reactQuery/useElevator';
import {FilterFields} from 'components/FilterFields';
import {Progress} from 'components/Progress';
import {EmptySection} from 'components/EmptySection';
import {DatePicker} from 'components/DatePicker';
import {Order, OrderByParams} from 'models/misc';
import {useFormatDate} from 'hooks/useFormatDate';
import {useQueryState} from 'hooks/useQueryState';
import {useNavigate} from 'react-router-dom';
import {FlexContainer} from 'components/FlexContainer';
import Box from '@mui/material/Box';
import {useSearchValues} from 'hooks/useSearchValues';
import {columns, makeRows} from './UnitsDataGridProps';

const pageInfo = makePage(0, 50);

export const UnitListingView = () => {
  const navigate = useNavigate();
  const formatDate = useFormatDate();
  const [lastVisitStart, setLastVisitStart] = useQueryState<Date | null>(
    'lastVisitStart',
    {
      defaultValue: null,
      isDate: true,
    },
  );
  const [lastVisitEnd, setLastVisitEnd] = useQueryState<Date | null>(
    'lastVisitEnd',
    {
      defaultValue: null,
      isDate: true,
    },
  );
  const [nextVisitStart, setNextVisitStart] = useQueryState<Date | null>(
    'nextVisitStart',
    {
      defaultValue: null,
      isDate: true,
    },
  );
  const [nextVisitEnd, setNextVisitEnd] = useQueryState<Date | null>(
    'nextVisitEnd',
    {
      defaultValue: null,
      isDate: true,
    },
  );

  const [search, setSearch] = useQueryState('searchUnits');
  const [page, setPage] = useQueryState('page', {defaultValue: pageInfo});
  const totalUnitsRef = useRef(0);
  const [pageCount, setPageCount] = useState(0);
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [resetDatePicker, setResetDatePicker] = useState(false);
  const textInput = useRef<HTMLInputElement>(null);

  const {values, clearValues} =
    useSearchValues<OrderByParams<ElevatorOrderField>>();
  const {sortOrder, orderByField} = values;

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
      orderBy: orderByField || ElevatorOrderField.CREATED_TIME,
      order: sortOrder || Order.DESC,
    },
    {keepPreviousData: true},
  );
  // set this value only once
  totalUnitsRef.current = totalUnitsRef.current || elevatorResponse.total;

  useEffect(() => {
    if (page.pageIndex) {
      setPage({...page, pageIndex: 0});
    }
    if (textInput.current) {
      textInput.current.value = search;
    }
  }, [search, lastVisitStart, lastVisitEnd, nextVisitStart, nextVisitEnd]);

  useEffect(() => {
    if (!isLoading) {
      setRows(makeRows(elevatorResponse.data, formatDate));
    }
  }, [elevatorResponse, isLoading]);

  useEffect(() => {
    if (elevatorResponse) {
      setPageCount(Math.ceil(elevatorResponse.total / page.pageSize));
    }
  }, [elevatorResponse, page]);

  if (isFetched && !totalUnitsRef.current) {
    return (
      <EmptySection
        label="No units yet. Please click the button below add."
        showActionBtn
        btnLabel="Add Unit"
        btnAction={() => {
          navigate('/units/new');
        }}
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
        clearValues();
        setResetDatePicker(true);
      }}
      wrapperStyle={{width: '90%'}}>
      <DatePicker
        defaultDate={lastVisitStart}
        containerStyles={{mr: '1em'}}
        reset={resetDatePicker}
        getReset={(val) => {
          if (val) {
            setResetDatePicker(false);
          }
        }}
        maxDate={lastVisitEnd || new Date()}
        getSelectedDate={(date) => setLastVisitStart(date)}
        inputLabelProps={{shrink: undefined}}
        textFieldProps={{
          label: 'Last Visit Start',
          sx: {background: '#fff'},
        }}
      />
      <DatePicker
        defaultDate={lastVisitEnd}
        maxDate={new Date()}
        minDate={lastVisitStart || undefined}
        reset={resetDatePicker}
        getReset={(val) => {
          if (val) {
            setResetDatePicker(false);
          }
        }}
        containerStyles={{mr: '1em'}}
        getSelectedDate={(date) => setLastVisitEnd(date)}
        inputLabelProps={{shrink: undefined}}
        textFieldProps={{
          label: 'Last Visit End',
          sx: {background: '#fff'},
        }}
      />

      <DatePicker
        defaultDate={nextVisitStart}
        minDate={new Date()}
        maxDate={nextVisitEnd || undefined}
        reset={resetDatePicker}
        getReset={(val) => {
          if (val) {
            setResetDatePicker(false);
          }
        }}
        containerStyles={{mr: '1em'}}
        getSelectedDate={(date) => setNextVisitStart(date)}
        inputLabelProps={{shrink: undefined}}
        textFieldProps={{
          label: 'Next Visit Start',
          sx: {background: '#fff'},
        }}
      />
      <DatePicker
        defaultDate={nextVisitEnd}
        minDate={nextVisitStart || new Date()}
        reset={resetDatePicker}
        getReset={(val) => {
          if (val) {
            setResetDatePicker(false);
          }
        }}
        containerStyles={{mr: '1em'}}
        getSelectedDate={(date) => setNextVisitEnd(date)}
        inputLabelProps={{shrink: undefined}}
        textFieldProps={{
          label: 'Next Visit End',
          sx: {background: '#fff'},
        }}
      />
    </FilterFields>
  );

  const renderWidget = () => (
    <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
      <Widget
        searchPlaceholder="Search by number, model, customer, address etc."
        getSearchValue={(val) => setSearch(val)}
        defaultSearchValue={search}
        filterItems={renderFilterItems()}
        refInput={textInput}
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
        rows={rows}
        columns={columns}
        scrollToTop={search}
        loading={isFetching}
        pageSize={page.pageSize}
        pageIndex={page.pageIndex + 1}
        handlePageSizeChange={(newPageSize: number) =>
          setPage({
            ...page,
            pageSize: newPageSize,
          })
        }
        handlePageChange={(newPage: number) => {
          setPage({
            ...page,
            pageIndex: newPage - 1,
          });
        }}
        pageCount={pageCount}
        totalRows={elevatorResponse.total}
      />
    </FlexContainer>
  );
};
