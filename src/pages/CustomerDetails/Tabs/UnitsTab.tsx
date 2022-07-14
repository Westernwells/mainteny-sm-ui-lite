import {useEffect, useRef, useState} from 'react';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {useNavigate} from 'react-router';
import {GridRowsProp} from '@mui/x-data-grid';
import Box from '@mui/material/Box';

import {FilterFields} from 'components/FilterFields';
import {Progress} from 'components/Progress';
import {DataGridLayout} from 'components/DataGridLayout';
import {TabContentContainer} from 'components/TabContentContainer';
import {EmptySection} from 'components/EmptySection';
import {DatePicker} from 'components/DatePicker';
import {ElevatorView} from 'models/elevator';
import {Widget} from 'components/Widget';
import {useQueryCustomerElevator} from 'hooks/reactQuery/useElevator';
import {formatDate} from 'utils/datetime';
import {columns, makeRows} from './CustomerUnitDataGrid';

interface Props {
  customerId?: string;
}

export const UnitsTab = ({customerId}: Props) => {
  const navigate = useNavigate();

  const [page, setPage] = useState(makePage(0, 25));
  const totalUnitsRef = useRef(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastVisitStart, setLastVisitStart] = useState<Date | null>(null);
  const [lastVisitEnd, setLastVisitEnd] = useState<Date | null>(null);
  const [nextVisitStart, setNextVisitStart] = useState<Date | null>(null);
  const [nextVisitEnd, setNextVisitEnd] = useState<Date | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [resetDatePicker, setResetDatePicker] = useState(false);
  const [rows, setRows] = useState<GridRowsProp>([]);
  const textInput = useRef<HTMLInputElement>(null);

  const {
    data: elevatorResource = createEmptyResource<ElevatorView>(25),
    isLoading,
    isFetching,
    isFetched,
  } = useQueryCustomerElevator(
    {
      query: searchQuery,
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
    },
    {},
    customerId,
    {keepPreviousData: true},
  );

  totalUnitsRef.current = totalUnitsRef.current || elevatorResource.total;

  useEffect(() => {
    setPageCount(Math.ceil(elevatorResource.total / page.pageSize));
  }, [elevatorResource, page.pageSize]);

  useEffect(() => {
    if (isFetched)
      setRows(
        makeRows({
          elevators: elevatorResource.data,
        }),
      );
  }, [elevatorResource]);

  const addNewUnit = () => {
    navigate('/units/new');
  };

  if (isFetched && !totalUnitsRef.current) {
    return (
      <EmptySection
        label="No units yet. Please click the button below to add!"
        showActionBtn
        btnLabel="Add Unit"
        btnAction={addNewUnit}
        containerStyle={{
          height: '100%',
          mb: '10em',
        }}
      />
    );
  }

  const clearFilters = () => {
    setLastVisitStart(null);
    setLastVisitEnd(null);
    setNextVisitStart(null);
    setNextVisitEnd(null);
    setResetDatePicker(true);
    setSearchQuery('');
    if (textInput.current) {
      textInput.current.value = '';
    }
  };

  const renderFilterItems = () => (
    <FilterFields
      onClear={clearFilters}
      wrapperStyle={{width: '90%'}}
      showFilter>
      <DatePicker
        defaultDate={lastVisitStart}
        reset={resetDatePicker}
        getReset={(val) => {
          if (val) {
            setResetDatePicker(false);
          }
        }}
        containerStyles={{mr: '1em'}}
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
        containerStyles={{mr: '1em'}}
        reset={resetDatePicker}
        getReset={(val) => {
          if (val) {
            setResetDatePicker(false);
          }
        }}
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
        containerStyles={{mr: '1em'}}
        reset={resetDatePicker}
        getReset={(val) => {
          if (val) {
            setResetDatePicker(false);
          }
        }}
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
        searchPlaceholder="Search by no, customer, type..."
        getSearchValue={(search) => setSearchQuery(search)}
        filterItems={renderFilterItems()}
        refInput={textInput}
      />
    </Box>
  );

  return (
    <TabContentContainer>
      {renderWidget()}
      {isLoading ? (
        <Progress />
      ) : (
        <DataGridLayout
          hideFooter={pageCount <= 1}
          rows={rows || []}
          columns={columns}
          loading={isFetching}
          scrollToTop={searchQuery}
          pageSize={page.pageSize}
          handlePageSizeChange={(newPageSize: number) =>
            setPage({...page, pageSize: newPageSize})
          }
          handlePageChange={(newPage: number) => {
            setPage({...page, pageIndex: newPage - 1});
          }}
          pageCount={pageCount}
          totalRows={elevatorResource.total}
          pageIndex={page.pageIndex + 1}
        />
      )}
    </TabContentContainer>
  );
};
