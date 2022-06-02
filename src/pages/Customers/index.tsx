import {PageListingLayout} from 'components/PageListingLayout';
import {useEffect, useRef, useState} from 'react';
import {GridRowsProp} from '@mui/x-data-grid';
import {DataGridLayout} from 'components/DataGridLayout';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {PropertyOwner} from 'models/propertyManager';
import {Progress} from 'components/Progress';
import {
  useFetchCustomerElevatorNumbers,
  useQueryCustomers,
} from 'hooks/reactQuery/useCustomers';
import {useSearchParams} from 'react-router-dom';
import {
  formatSearchParamsPageIndex,
  formatSearchParamsPageSize,
} from 'utils/utils';
import {EmptySection} from 'components/EmptySection';
import {Widget} from '../../components/Widget';
import {columns, makeRows} from './CustomerDataGridProps';

const pageSize = 25;

export const Customer = () => {
  const [search, setSearch] = useState('');
  const [queryParams, setQueryParams] = useSearchParams();
  const totalCustomerRef = useRef(0);
  const [page, setPage] = useState(makePage(0, pageSize));
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [pageCount, setPageCount] = useState(0);

  const {
    data: customerResource = createEmptyResource<PropertyOwner>(pageSize),
    isFetched: customerResourceFetched,
  } = useQueryCustomers(
    {
      pageIndex: page.pageIndex,
      pageSize: page.pageSize,
      query: search,
    },
    {keepPreviousData: true},
  );
  totalCustomerRef.current = totalCustomerRef.current || customerResource.total;

  const {
    data: customersWithUnits = [],
    isLoading,
    isFetching,
    isIdle,
    isFetched,
  } = useFetchCustomerElevatorNumbers(customerResource.data, {
    enabled: customerResourceFetched,
    keepPreviousData: true,
  });

  useEffect(() => {
    const currentParams = Object.fromEntries([...queryParams]);

    setPage({
      ...page,
      pageSize: Number(currentParams.pageSize),
      pageIndex: Number(currentParams.pageIndex) - 1,
    });
  }, [queryParams]);

  useEffect(() => {
    if (customersWithUnits.length) {
      setRows(makeRows(customersWithUnits));
    }
  }, [customersWithUnits]);

  useEffect(() => {
    setPageCount(Math.ceil(customerResource.total / page.pageSize));
  }, [customerResource, page.pageSize]);

  if (isIdle || isLoading) {
    return <Progress />;
  }

  if (isFetched && !totalCustomerRef.current) {
    return (
      <EmptySection
        label="No customers have been created yet. Please click the button below to create one!"
        showActionBtn
        btnLabel="Add Customer"
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
          searchPlaceholder="Search by number, name, address etc."
          getSearchValue={(val: string) => setSearch(val)}
        />
      }>
      <DataGridLayout
        rows={rows}
        columns={columns}
        loading={isFetching}
        hideFooter={pageCount <= 1}
        pageSize={page.pageSize}
        pageIndex={page.pageIndex + 1}
        handlePageSizeChange={(newPageSize: number) =>
          setQueryParams(formatSearchParamsPageSize(newPageSize, queryParams))
        }
        handlePageChange={(newPage: number) =>
          setQueryParams(formatSearchParamsPageIndex(newPage, queryParams))
        }
        pageCount={pageCount}
        totalRows={customerResource.total}
      />
    </PageListingLayout>
  );
};
