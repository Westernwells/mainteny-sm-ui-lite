import {useEffect, useRef, useState} from 'react';
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
import {useContractInvoices} from 'hooks/reactQuery/useInvoice';
import {PageListingLayout} from 'components/PageListingLayout';
import {mapInvoiceStatus} from 'utils/invoice';
import {Progress} from 'components/Progress';
import {EmptySection} from 'components/EmptySection';
import {useFormatDate} from 'hooks/useFormatDate';
import {useQueryState} from 'hooks/useQueryState';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {DataSyncType} from 'models/service-company';
import useLastSyncedItem from 'hooks/useLastSyncedItem';
import {useCompanyXeroInfo} from 'hooks/reactQuery/useCompanies';
import {Typography} from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';
import {useTranslation} from 'react-i18next';
import {useSearchValues} from 'hooks/useSearchValues';
import {Widget} from 'components/Widget';
import {createEmptyResource, makePage} from 'utils/paging';
import {OrderByParams} from 'models/misc';
import {Box} from '@mui/system';
import {columns, makeRows} from './InvoicesDataGridProps';

const pageSize = 25;

export const Invoices = ({contractId}: {contractId?: string}) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const {user} = useUserSession();
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
  const [cost] = useQueryState<number[][]>('cost', {
    defaultValue: [],
  });
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [pageCount, setPageCount] = useState(0);
  const textInput = useRef<HTMLInputElement>(null);

  const {data: xeroInfoData} = useCompanyXeroInfo(
    user?.userAccount.serviceCompany.id,
  );
  const {lastSyncedText} = useLastSyncedItem({
    syncType: DataSyncType.INVOICE,
  });

  const {
    data: contractInvoiceResource = createEmptyResource<InvoiceView>(10),
    isLoading: isLoadingContractInvoiceResource,
    isFetching: isFetchingContractInvoiceResource,
    isFetched: isFetchedContractInvoiceResource,
    isIdle: isIdleContractInvoiceResource,
  } = useContractInvoices(
    contractId ?? '',
    {
      pageIndex: page.pageIndex,
      pageSize: page.pageSize,
      query: search,
      status: status ? [status] : [],
      ...(sortOrder && {order: sortOrder}),
      ...(orderByField && {orderByField}),
    },
    {keepPreviousData: true},
  );

  const {invoiceResource, isLoading, isFetching, isFetched, isIdle} = {
    invoiceResource: contractInvoiceResource,
    isLoading: isLoadingContractInvoiceResource,
    isFetching: isFetchingContractInvoiceResource,
    isFetched: isFetchedContractInvoiceResource,
    isIdle: isIdleContractInvoiceResource,
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

  const renderFilterItems = () => (
    <FilterFields
      onClear={clearValues}
      clearText="Clear all"
      textStyles={{color: theme.palette.primary.dark, fontWeight: 600}}
      wrapperStyle={{flex: 1, gap: 1.5}}
      containerStyle={{width: '13%', gap: 1.5}}>
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
        label="No invoices yet."
        btnLabel="Add Invoice"
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
          containerStyles={{mt: 2}}
          searchPlaceholder="Search by number, customer, service type etc."
          getSearchValue={(val: string) => setSearch(val)}
          refInput={textInput}
          btnLabel="New Invoice"
          filterItems={renderFilterItems()}
        />
      }>
      <Box
        sx={{
          pt: 3,
          pb: 3,
          backgroundColor: theme.palette.primary.contrastText,
          mt: 3,
        }}>
        <Typography
          sx={{pl: 2}}
          variant="h6"
          color={theme.palette.info.infoAlert}>
          {t('Invoice Schedule')}
        </Typography>
      </Box>
      <DataGridLayout
        isCellClickable={false}
        containerStyle={{margin: 'unset'}}
        isEvenRowDifferentColor
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
