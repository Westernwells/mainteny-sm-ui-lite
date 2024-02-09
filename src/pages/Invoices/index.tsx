import {useEffect, useMemo, useRef, useState} from 'react';
import {GridRowsProp} from '@mui/x-data-grid';
import {FilterFields} from 'components/FilterFields';
import {MultipleSelectCheckmarks} from 'components/MultipleSelectCheckmarks';
import {DataGridLayout} from 'components/DataGridLayout';
import {
  InvoiceOrderField,
  InvoiceStatus,
  InvoiceStatusView,
  InvoiceView,
} from 'models/invoice';
import {useElevatorInvoices, useInvoices} from 'hooks/reactQuery/useInvoice';
import {PageListingLayout} from 'components/PageListingLayout';
import {useNavigate} from 'react-router-dom';
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
import {useQueryState} from 'hooks/useQueryState';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {DataSyncType} from 'models/service-company';
import useLastSyncedItem from 'hooks/useLastSyncedItem';
import {useCompanyXeroInfo} from 'hooks/reactQuery/useCompanies';
import {Alert, Typography} from '@mui/material';
import {theme} from 'theme';
import {useTranslation} from 'react-i18next';
import {useSearchValues} from 'hooks/useSearchValues';
import {Widget} from '../../components/Widget';
import {createEmptyResource, makePage} from '../../utils/paging-utils';
import {columns, makeRows} from './InvoicesDataGridProps';
import {OrderByParams} from '../../models/misc';

const pageSize = 25;

export const Invoices = ({elevatorId}: {elevatorId?: string}) => {
  const {t} = useTranslation();
  const {user} = useUserSession();
  const currentCurrency = useCurrentCurrency();
  const navigate = useNavigate();
  const formatDate = useFormatDate();

  const {values, clearValues} =
    useSearchValues<OrderByParams<InvoiceOrderField>>();
  const {sortOrder, orderByField} = values;

  const [search, setSearch] = useQueryState('searchInvoices');
  const [page, setPage] = useQueryState('page', {
    defaultValue: makePage(0, pageSize),
  });
  const totalInvoiceRef = useRef(0);
  const [status, setStatus] = useQueryState<InvoiceStatus>('status');
  const [cost, setCost] = useQueryState<number[][]>('cost', {
    defaultValue: [],
  });
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [pageCount, setPageCount] = useState(0);
  const textInput = useRef<HTMLInputElement>(null);

  const [totalAmountFrom, totalAmountTo] = useMemo(
    () => getStartEndPrice(cost),
    [cost],
  );

  const {data: xeroInfoData} = useCompanyXeroInfo(
    user?.userAccount.serviceCompany.id,
  );
  const {lastSyncedText} = useLastSyncedItem({
    syncType: DataSyncType.INVOICE,
  });

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
      ...(cost.length > 0 && {
        totalAmountFrom,
        totalAmountTo,
      }),
      ...(sortOrder && {order: sortOrder}),
      ...(orderByField && {orderByField}),
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
      ...(sortOrder && {order: sortOrder}),
      ...(orderByField && {orderByField}),
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

  useEffect(() => {
    if (invoiceResource.total > 0 && invoiceResource.data.length === 0) {
      setPage({
        ...page,
        pageIndex: 0,
      });
    }
  }, [search, status, cost, invoiceResource]);

  useEffect(() => {
    if (textInput.current && !textInput.current.value) {
      textInput.current.value = search;
    }
  }, []);

  useEffect(() => {
    if (!isLoading) {
      setRows(
        makeRows(
          invoiceResource.data,
          user?.userAccount.serviceCompany.id,
          formatDate,
        ),
      );
    }
  }, [invoiceResource, isLoading]);

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
      onClear={clearValues}
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
        getSelectedValue={(items) => {
          if (items.length > 0) {
            setStatus(mapInvoiceStatus(items[0] as InvoiceStatusView));
          }
        }}
        multiple={false}
        initialSelectedItems={status && [InvoiceStatusView[status]]}
        formControlStyles={{width: '100%'}}
        containerStyles={{flex: 1}}
        disableClearBtn
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
      <Alert sx={{m: '1em 0em'}} severity="info">
        <Typography color={theme.palette.info.infoAlert}>
          {t(
            'Please note that cancelled invoices remain accessible on this dashboard. You can view and manage them here.',
          )}
        </Typography>
      </Alert>
      <DataGridLayout
        rows={rows || []}
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
        totalRows={invoiceResource?.total}
        lastSyncedText={xeroInfoData?.enabled ? lastSyncedText : ''}
      />
    </PageListingLayout>
  );
};

export default Invoices;
