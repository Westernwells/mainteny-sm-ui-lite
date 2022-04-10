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
import {CustomPagination} from 'components/CustomPagination';
import {Widget} from '../../components/Widget';
import {columns, makeRows} from './CustomerDataGridProps';

const pageSize = 25;

export const Customer = () => {
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
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
          handlePageSizeChange={(newPageSize: number) =>
            setPage({...page, pageSize: newPageSize})
          }
          handlePageChange={(newPage: number) => {
            setPage({...page, pageIndex: newPage - 1});
          }}
          pageCount={pageCount}
          totalRows={customerResource.total}
        />
      ) : null}
    </PageOverviewLayout>
  );
};
