import {PageOverviewLayout} from 'components/PageOverviewLayout';
import {useEffect, useState} from 'react';
import {GridRowsProp} from '@mui/x-data-grid';
import {DataGridLayout} from 'components/DataGridLayout';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {PropertyOwner} from 'models/propertyManager';
import {
  useFetchCustomerElevatorNumbers,
  useQueryCustomers,
} from 'hooks/reactQuery/useCustomers';
import {useSearchParams} from 'react-router-dom';
import {
  formatSearchParamsPageIndex,
  formatSearchParamsPageSize,
} from 'utils/utils';
import {CustomPagination} from 'components/CustomPagination';
import {Widget} from '../../components/Widget';
import {columns, makeRows} from './CustomerDataGridProps';

const pageSize = 25;

export const Customer = () => {
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [queryParams, setQueryParams] = useSearchParams();
  const [page, setPage] = useState(makePage(0, pageSize));
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [pageCount, setPageCount] = useState(0);

  const {
    data: customerResource = createEmptyResource<PropertyOwner>(pageSize),
  } = useQueryCustomers(
    {
      pageIndex: page.pageIndex,
      pageSize: page.pageSize,
      query: search,
    },
    {keepPreviousData: true},
  );

  const {data: customersWithUnits} = useFetchCustomerElevatorNumbers(
    customerResource.data,
  );

  useEffect(() => {
    const currentParams = Object.fromEntries([...queryParams]);

    setPage({
      ...page,
      pageSize: Number(currentParams.pageSize),
      pageIndex: Number(currentParams.pageIndex) - 1,
    });
  }, [queryParams]);

  useEffect(() => {
    if (customersWithUnits) {
      setRows(makeRows(customersWithUnits));
    } else {
      setRows([]);
    }
  }, [customersWithUnits]);

  useEffect(() => {
    setPageCount(Math.ceil(customerResource.total / page.pageSize));
  }, [customerResource, page.pageSize]);

  return (
    <PageOverviewLayout
      label="Customers"
      renderWidget={
        <Widget
          searchPlaceholder="Try 'Astralift BV'"
          getSearchValue={(val: string) => setSearch(val)}
          setShowFilter={setShowFilter}
          showFilter={showFilter}
          hideViewOption
          hideFilter
        />
      }>
      <DataGridLayout rows={rows} columns={columns} hideFooter />
      {pageCount && page.pageSize < customerResource.total ? (
        <CustomPagination
          pageSize={page.pageSize}
          pageIndex={page.pageIndex}
          handlePageSizeChange={(newPageSize: number) =>
            setQueryParams(formatSearchParamsPageSize(newPageSize, queryParams))
          }
          handlePageChange={(newPage: number) =>
            setQueryParams(formatSearchParamsPageIndex(newPage, queryParams))
          }
          pageCount={pageCount}
          totalRows={customerResource.total}
        />
      ) : null}
    </PageOverviewLayout>
  );
};
