import {useEffect, useMemo, useRef, useState} from 'react';
import {GridRowsProp} from '@mui/x-data-grid';
import {FilterFields} from 'components/FilterFields';
import {MultipleSelectCheckmarks} from 'components/MultipleSelectCheckmarks';
import {DataGridLayout} from 'components/DataGridLayout';
import {InvoiceStatus, InvoiceStatusView, InvoiceView} from 'models/invoice';
import {useElevatorInvoices, useInvoices} from 'hooks/reactQuery/useInvoice';
import {PageListingLayout} from 'components/PageListingLayout';
import {
  formatSearchParamsPageIndex,
  formatSearchParamsPageSize,
} from 'utils/utils';
import {useSearchParams, useNavigate} from 'react-router-dom';
import {Mixpanel} from 'mixpanel/mixpanel';
import {mixpanelEvents} from 'mixpanel/constants';
import {
  costRangeConvertor as crConverter,
  getStartEndPrice,
} from 'utils/contract-utils';
import {mapInvoiceStatus} from 'utils/invoice';
import {useCurrentCurrency} from 'utils/currency';
import {Progress} from 'components/Progress';
import {EmptySection} from 'components/EmptySection';
import {PriceRangeDropdown} from 'components/PriceRangeDropdown';
import {useFormatDate} from 'hooks/useFormatDate';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {useQueryState} from 'hooks/useQueryState';
import {DataSyncType} from 'models/service-company';
import useLastSyncedItem from 'hooks/useLastSyncedItem';
import {Widget} from '../../components/Widget';
import {createEmptyResource, makePage} from '../../utils/paging-utils';
import {columns, makeRows} from './InvoicesDataGridProps';

const pageSize = 25;

export const Invoices = ({elevatorId}: {elevatorId?: string}) => {
  const currentCurrency = useCurrentCurrency();
  const navigate = useNavigate();
  const formatDate = useFormatDate();
  const [search, setSearch] = useQueryState('searchInvoices');
  const [page, setPage] = useState(makePage(0, pageSize));
  const [queryParams, setQueryParams] = useSearchParams();
  const totalInvoiceRef = useRef(0);
  const [status, setStatus] = useState<InvoiceStatus>();
  const [cost, setCost] = useState<number[][]>([]);
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [pageCount, setPageCount] = useState(0);
  const textInput = useRef<HTMLInputElement>(null);

  const [totalAmountFrom, totalAmountTo] = useMemo(
    () => getStartEndPrice(cost),
    [cost],
  );

  const {
    data: allInvoiceResource = createEmptyResource<InvoiceView>(10),
    isLoading: isLoadingAllInvoiceResource,
    isFetching: isFetchingAllInvoiceResource,
    isFetched: isFetchedAllInvoiceResource,
    isIdle: isIdleAllInvoiceResource,
  } = useInvoices(
    {
      pageIndex: page.pageIndex,
      pageSize: page.pageSize,
      query: search,
      status: status ? [status] : [],
      totalAmountFrom,
      totalAmountTo,
    },
    {keepPreviousData: true},
  );

  const {
    data: elevatorInvoiceResource = createEmptyResource<InvoiceView>(10),
    isLoading: isLoadingElevatorInvoiceResource,
    isFetching: isFetchingElevatorInvoiceResource,
    isFetched: isFetchedElevatorInvoiceResource,
    isIdle: isIdleElevatorInvoiceResource,
  } = useElevatorInvoices(
    elevatorId ?? '',
    {
      pageIndex: page.pageIndex,
      pageSize: page.pageSize,
      query: search,
      status: status ? [status] : [],
      totalAmountFrom,
      totalAmountTo,
    },
    {keepPreviousData: true},
  );

  const {invoiceResource, isLoading, isFetching, isFetched, isIdle} = elevatorId
    ? {
        invoiceResource: elevatorInvoiceResource,
        isLoading: isLoadingElevatorInvoiceResource,
        isFetching: isFetchingElevatorInvoiceResource,
        isFetched: isFetchedElevatorInvoiceResource,
        isIdle: isIdleElevatorInvoiceResource,
      }
    : {
        invoiceResource: allInvoiceResource,
        isLoading: isLoadingAllInvoiceResource,
        isFetching: isFetchingAllInvoiceResource,
        isFetched: isFetchedAllInvoiceResource,
        isIdle: isIdleAllInvoiceResource,
      };

  totalInvoiceRef.current = totalInvoiceRef.current || invoiceResource.total;

  const pdfPaths = invoiceResource.data
    .map((i) => i.additionalInfo.pdfPath)
    .filter((pdfPath) => pdfPath !== undefined);
  const {data: downloadUrls} = useDownloadUrl(
    invoiceResource.data ? pdfPaths : [],
  );

  const {lastSyncedText} = useLastSyncedItem({
    syncType: DataSyncType.PROPERTY_OWNER,
  });

  useEffect(() => {
    if (page.pageIndex) {
      setQueryParams(formatSearchParamsPageIndex(1, queryParams));
    }
    if (textInput.current) {
      textInput.current.value = search;
    }
  }, [search, status, cost]);

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
    if (!isLoading) {
      setRows(makeRows(invoiceResource.data, downloadUrls, formatDate));
    }
  }, [invoiceResource, isLoading, downloadUrls]);

  useEffect(() => {
    setPageCount(Math.ceil(invoiceResource.total / page.pageSize));
  }, [invoiceResource, pageSize]);

  const navigateToNewInvoice = () => {
    Mixpanel.identifyAndTrack(mixpanelEvents.NEW_INVOICE_BUTTON_CLICKED);
    navigate('/invoices/new');
  };

  const costRangeConvertor = (selectedItems: string[]) => {
    const range = crConverter(selectedItems, currentCurrency.symbol);
    setCost(range);
  };

  const renderFilterItems = () => (
    <FilterFields
      onClear={() => {
        setStatus(undefined);
        setCost([]);
        setSearch('');
        if (textInput.current) {
          textInput.current.value = '';
        }
      }}
      wrapperStyle={{flex: 1, gap: 1.5}}
      containerStyle={{width: '35%', gap: 1.5}}>
      <PriceRangeDropdown
        cost={cost}
        costRangeConvertor={costRangeConvertor}
        formControlStyles={{width: '100%'}}
        containerStyles={{flex: 1}}
      />
      <MultipleSelectCheckmarks
        label="Status"
        options={Object.values(InvoiceStatusView).map((value) => value)}
        getSelectedValue={(items: string[]) =>
          setStatus(mapInvoiceStatus((items as InvoiceStatusView[])[0]))
        }
        multiple={false}
        initialSelectedItems={status ? [status] : []}
        formControlStyles={{width: '100%'}}
        containerStyles={{flex: 1}}
      />
    </FilterFields>
  );

  if (isIdle || isLoading) {
    return <Progress />;
  }

  if (isFetched && !totalInvoiceRef.current) {
    return (
      <EmptySection
        label="No invoices yet. Please click the button below to add."
        showActionBtn
        btnLabel="Add Invoice"
        containerStyle={{
          height: '100%',
          mb: '10em',
        }}
        btnAction={navigateToNewInvoice}
      />
    );
  }

  return (
    <PageListingLayout
      renderWidget={
        <Widget
          searchPlaceholder="Search by number, customer, service type etc."
          getSearchValue={(val: string) => setSearch(val)}
          showActionBtn={!elevatorId}
          refInput={textInput}
          btnLabel="New Invoice"
          btnOnClick={navigateToNewInvoice}
          filterItems={renderFilterItems()}
        />
      }>
      <DataGridLayout
        rows={rows || []}
        columns={columns}
        loading={isFetching}
        scrollToTop={search}
        hideFooter={pageCount < 1}
        pageSize={page.pageSize}
        pageIndex={page.pageIndex + 1}
        handlePageSizeChange={(newPageSize: number) =>
          setQueryParams(formatSearchParamsPageSize(newPageSize, queryParams))
        }
        handlePageChange={(newPage: number) =>
          setQueryParams(formatSearchParamsPageIndex(newPage, queryParams))
        }
        pageCount={pageCount}
        totalRows={invoiceResource?.total}
        lastSyncedText={lastSyncedText}
      />
    </PageListingLayout>
  );
};

export default Invoices;
