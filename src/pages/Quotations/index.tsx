import {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {GridRowsProp} from '@mui/x-data-grid';
import {DataGridLayout} from 'components/DataGridLayout';
import {MultipleSelectCheckmarks} from 'components/MultipleSelectCheckmarks';
import {FilterFields} from 'components/FilterFields';
import {useQuotations} from 'hooks/reactQuery/useQuotation';
import {
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
import {columns, makeRows} from './QuotationsDataGridProps';

const pageSize = 25;

export const Quotations = () => {
  const navigate = useNavigate();
  const formatDate = useFormatDate();

  const [search, setSearch, clearFilters] = useQueryState('searchQuotations');
  const totalQuotationsRef = useRef(0);
  const [status, setStatus] = useQueryState<QuotationStatus[]>('status', {
    defaultValue: [],
  });
  const [page, setPage] = useQueryState('page', {
    defaultValue: makePage(0, pageSize),
  });
  const [pageCount, setPageCount] = useState(0);
  const [rows, setRows] = useState<GridRowsProp>([]);
  const textInput = useRef<HTMLInputElement>(null);

  const {
    data: quotationsResource = createEmptyResource<QuotationView>(pageSize),
    isLoading,
    isFetching,
    isFetched,
  } = useQuotations(
    {
      pageIndex: page.pageIndex,
      pageSize: page.pageSize,
      query: search,
      status,
    },
    {},
    {keepPreviousData: true},
  );

  totalQuotationsRef.current =
    totalQuotationsRef.current || quotationsResource.total;

  useEffect(() => {
    if (quotationsResource.total > 0 && quotationsResource.data.length === 0) {
      setPage({
        ...page,
        pageIndex: 0,
      });
    }
    if (textInput.current) {
      textInput.current.value = search;
    }
  }, [quotationsResource, search, `${status}`]); // hack to not re-render when number of units array reference changes

  useEffect(() => {
    if (!isLoading) {
      setRows(makeRows(quotationsResource, formatDate));
    }
  }, [quotationsResource, isLoading]);

  useEffect(() => {
    setPageCount(Math.ceil(quotationsResource.total / page.pageSize));
  }, [quotationsResource, page.pageSize]);

  const navigateToNewQuotation = () => {
    Mixpanel.identifyAndTrack(mixpanelEvents.NEW_QUOTATION_BUTTON_CLICKED);
    navigate('new');
  };

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
  const renderFilterItems = () => (
    <FilterFields onClear={clearFilters}>
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

  if (isLoading) {
    return <Progress />;
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
        rows={rows}
        columns={columns}
        loading={isFetching}
        scrollToTop={search}
        pageSize={page.pageSize}
        pageIndex={page.pageIndex + 1}
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
