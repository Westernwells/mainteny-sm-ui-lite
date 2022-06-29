import {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router';
import {useSearchParams} from 'react-router-dom';
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
import {
  convertToMacro,
  convertToText,
  formatSearchParamsPageIndex,
  formatSearchParamsPageSize,
} from 'utils/utils';
import {Mixpanel} from 'mixpanel/mixpanel';
import {mixpanelEvents} from 'mixpanel/constants';
import {columns, makeRows} from './QuotationsDataGridProps';

const pageSize = 25;

export const Quotations = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const totalQuotationsRef = useRef(0);
  const [status, setStatus] = useState<QuotationStatus[]>([]);
  const [page, setPage] = useState(makePage(0, pageSize));
  const [queryParams, setQueryParams] = useSearchParams();
  const [pageCount, setPageCount] = useState(0);
  const [rows, setRows] = useState<GridRowsProp>([]);
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
    if (!isLoading) {
      setRows(makeRows(quotationsResource));
    }
  }, [quotationsResource, isLoading]);

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
    setPageCount(Math.ceil(quotationsResource.total / page.pageSize));
  }, [quotationsResource, page.pageSize]);

  const navigateToNewQuotation = () => {
    Mixpanel.identifyAndTrack(mixpanelEvents.NEW_QUOTATION_BUTTON_CLICKED);
    navigate('new');
  };

  if (isFetched && !totalQuotationsRef.current) {
    return (
      <EmptySection
        label="No quotations have been created yet. Please click the button below to create one!"
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
    <FilterFields onClear={() => setStatus([])}>
      <MultipleSelectCheckmarks
        label="Status"
        options={Object.keys(QuotationStatusView).map((i) => convertToText(i))}
        initialSelectedItems={status}
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
          btnLabel="New Quotation"
          btnOnClick={navigateToNewQuotation}
          filterItems={renderFilterItems()}
        />
      }>
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
        totalRows={quotationsResource.total}
      />
    </PageListingLayout>
  );
};
