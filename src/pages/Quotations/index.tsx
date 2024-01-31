import {useEffect, useMemo, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {GridRowsProp} from '@mui/x-data-grid';
import {DataGridLayout} from 'components/DataGridLayout';
import {MultipleSelectCheckmarks} from 'components/MultipleSelectCheckmarks';
import {FilterFields} from 'components/FilterFields';
import {useQuotations} from 'hooks/reactQuery/useQuotation';
import {
  QueryQuotationParams,
  QuotationOrderField,
  QuotationStatus,
  QuotationStatusView,
  QuotationView,
} from 'models/quotation';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {PageListingLayout} from 'components/PageListingLayout';
import {Widget} from 'components/Widget';
import {Progress} from 'components/Progress';
import {EmptySection} from 'components/EmptySection';
import {convertToMacro, convertToText, objectKeyByValue} from 'utils/utils';
import {Mixpanel} from 'mixpanel/mixpanel';
import {mixpanelEvents} from 'mixpanel/constants';
import {useFormatDate} from 'hooks/useFormatDate';
import {useQueryState} from 'hooks/useQueryState';
import {useCurrentCurrency} from 'utils/currency';
import {
  costRangeConvertor as crConverter,
  getStartEndPrice,
} from 'utils/contract-utils';
import {PriceRangeDropdown} from 'components/PriceRangeDropdown';
import {useTranslation} from 'react-i18next';
import {Order} from 'models/misc';
import DatePickerRange from 'components/DatePickerRange';
import {DateRange} from '@mui/x-date-pickers-pro';
import {columns, makeRows} from './QuotationsDataGridProps';

const pageSize = 25;

export const Quotations = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const formatDate = useFormatDate();
  const currentCurrency = useCurrentCurrency();

  const [search, setSearch, clearFilters] = useQueryState('searchQuotations');
  const totalQuotationsRef = useRef(0);
  const [sortOrder, setSortOrder] = useQueryState<Order | undefined>(
    'sortOrder',
  );
  const [orderByField, setOrderByField] = useQueryState<
    QuotationOrderField | undefined
  >('orderByField');
  const [status, setStatus] = useQueryState<QuotationStatus[]>('status', {
    defaultValue: [],
  });
  const [page, setPage] = useQueryState('page', {
    defaultValue: makePage(0, pageSize),
  });
  const [pageCount, setPageCount] = useState(0);
  const [rows, setRows] = useState<GridRowsProp>([]);
  const textInput = useRef<HTMLInputElement>(null);

  const [cost, setCost] = useQueryState<number[][]>('cost', {defaultValue: []});

  const [salesPriceStart, salesPriceEnd] = useMemo(
    () => getStartEndPrice(cost),
    [cost],
  );

  const [selectedDateRange, setSelectedDateRange] = useQueryState<
    DateRange<Date | null>
  >('dateRange', {defaultValue: [null, null]});

  const queryParam: QueryQuotationParams = {
    pageIndex: page.pageIndex,
    pageSize: page.pageSize,
    query: search,
    status,
    ...(cost.length > 0 && {
      salesPriceStart,
      salesPriceEnd,
    }),
    ...(selectedDateRange &&
      selectedDateRange[0] !== null &&
      selectedDateRange[1] !== null && {
        createdDateStart: selectedDateRange[0],
        createdDateEnd: selectedDateRange[1],
      }),
    ...(sortOrder && {order: sortOrder}),
    ...(orderByField && {orderByField}),
  };

  const {
    data: quotationsResource = createEmptyResource<QuotationView>(pageSize),
    isLoading,
    isFetching,
    isFetched,
    isIdle,
  } = useQuotations(queryParam, {keepPreviousData: true});

  totalQuotationsRef.current =
    totalQuotationsRef.current || quotationsResource.total;

  const navigateToNewQuotation = () => {
    Mixpanel.identifyAndTrack(mixpanelEvents.NEW_QUOTATION_BUTTON_CLICKED);
    navigate('new');
  };

  const costRangeConvertor = (selectedItems: string[]) => {
    const range = crConverter(selectedItems, currentCurrency.symbol);
    setCost(range);
  };

  const handleDateSelection = (dateValues: DateRange<Date>) => {
    setSelectedDateRange(dateValues);
  };

  const handleSortModelChange = (sortingField: any, sortingOrder: any) => {
    setSortOrder(sortingOrder.toUpperCase() as Order);
    setOrderByField(sortingField as QuotationOrderField);
  };

  useEffect(() => {
    if (quotationsResource.total > 0 && quotationsResource.data.length === 0) {
      setPage({
        ...page,
        pageIndex: 0,
      });
    }
  }, [quotationsResource, search, cost, `${status}`, `${selectedDateRange}`]); // hack to not re-render when number of units array reference changes

  useEffect(() => {
    if (textInput.current && !textInput.current.value) {
      textInput.current.value = search;
    }
  }, []);

  useEffect(() => {
    if (!isLoading) {
      setRows(makeRows(quotationsResource, formatDate));
    }
  }, [quotationsResource, isLoading]);

  useEffect(() => {
    setPageCount(Math.ceil(quotationsResource.total / page.pageSize));
  }, [quotationsResource, page.pageSize]);

  const renderFilterItems = () => (
    <FilterFields
      onClear={clearFilters}
      containerStyle={{alignItems: 'center'}}
      wrapperStyle={{alignItems: 'center'}}>
      <DatePickerRange
        defaultDate={selectedDateRange}
        containerStyles={{mr: '1em', width: '100%', marginTop: '-0.5em'}}
        getSelectedDate={(newValue) => {
          handleDateSelection(newValue);
        }}
        disableMask
        textFieldProps={{
          label: t('Created Date Range'),
          sx: {
            width: '100%',
            background: 'white',
            '& .MuiInputBase-sizeSmall, .MuiInputBase-adornedEnd ': {
              background: 'white',
            },
          },
          size: 'small',
        }}
      />
      <PriceRangeDropdown
        cost={cost}
        costRangeConvertor={costRangeConvertor}
        label={t('Sales Price Range')}
      />
      <MultipleSelectCheckmarks
        label="Status"
        options={Object.keys(QuotationStatusView).map((i) => convertToText(i))}
        initialSelectedItems={status.map((i) =>
          convertToText(objectKeyByValue(QuotationStatusView, i)),
        )}
        getSelectedValue={(item) =>
          setStatus(
            item
              .map(
                (i) =>
                  QuotationStatusView[
                    convertToMacro(i) as keyof typeof QuotationStatusView
                  ],
              )
              .map((j) => QuotationStatus[j as keyof typeof QuotationStatus]),
          )
        }
      />
    </FilterFields>
  );

  if (isIdle) {
    return <Progress />;
  }

  if (isFetched && !totalQuotationsRef.current) {
    return (
      <EmptySection
        label="No quotations yet. Please click the button below to add."
        showActionBtn
        btnLabel="Add Quotation"
        btnAction={navigateToNewQuotation}
        containerStyle={{
          height: '100%',
          mb: '10em',
        }}
      />
    );
  }

  return (
    <PageListingLayout
      renderWidget={
        <Widget
          searchPlaceholder="Search by number, customer, address etc."
          getSearchValue={(val: string) => setSearch(val)}
          showActionBtn
          refInput={textInput}
          btnLabel="New Quotation"
          btnOnClick={navigateToNewQuotation}
          filterItems={renderFilterItems()}
        />
      }>
      <DataGridLayout
        rows={rows || []}
        columns={columns(handleSortModelChange)}
        loading={isFetching}
        scrollToTop={search}
        pageSize={page.pageSize}
        pageIndex={page.pageIndex + 1}
        onSortModelChange={handleSortModelChange}
        handlePageSizeChange={(newPageSize: number) =>
          setPage({
            ...page,
            pageSize: newPageSize,
          })
        }
        handlePageChange={(newPage: number) =>
          setPage({
            ...page,
            pageIndex: newPage - 1,
          })
        }
        pageCount={pageCount}
        totalRows={quotationsResource.total}
      />
    </PageListingLayout>
  );
};

export default Quotations;
