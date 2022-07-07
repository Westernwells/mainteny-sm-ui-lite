import {useEffect, useRef, useState} from 'react';
import {useNavigate, useParams} from 'react-router';
import {endOfYear, startOfYear} from 'date-fns';
import {GridRowsProp} from '@mui/x-data-grid';
import {useServiceOrders} from 'hooks/reactQuery/useServiceOrder';
import {
  ServiceOrderStatus,
  ServiceOrderType,
  ServiceOrderView,
} from 'models/service-order';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {EmptySection} from 'components/EmptySection';
import {FilterFields} from 'components/FilterFields';
import {MultipleSelectCheckmarks} from 'components/MultipleSelectCheckmarks';
import {PageListingLayout} from 'components/PageListingLayout';
import {Widget} from 'components/Widget';
import {DataGridLayout} from 'components/DataGridLayout';
import {
  serviceOrderStatusToString,
  serviceOrderTypeToEnum,
  serviceOrderTypeToString,
} from 'utils/service-order-utils';
import {columns, makeRows} from './ServiceHistoryDataGridProps';

const pageSize = 25;

const serviceOrderStatusMap = {
  Unscheduled: ServiceOrderStatus.READY_TO_SCHEDULE,
  Pending: ServiceOrderStatus.SCHEDULED,
  Ongoing: ServiceOrderStatus.IN_PROGRESS,
  Completed: ServiceOrderStatus.COMPLETED,
  Cancelled: ServiceOrderStatus.CANCELLED,
  Expired: ServiceOrderStatus.EXPIRED,
};
type serviceOrderStatusMapKey = keyof typeof serviceOrderStatusMap;

export const ServiceHistoryTab = () => {
  const {id: elevatorId} = useParams();
  const navigate = useNavigate();

  const totalRef = useRef(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(makePage(0, pageSize));
  const [pageCount, setPageCount] = useState(0);
  const [status, setStatus] = useState<ServiceOrderStatus[]>([]);
  const [types, setTypes] = useState<ServiceOrderType[]>([]);
  const [rows, setRows] = useState<GridRowsProp>([]);

  const {
    data: serviceOrdersResource = createEmptyResource<ServiceOrderView>(
      pageSize,
    ),
    isFetching,
    isFetched,
  } = useServiceOrders({
    elevatorIds: elevatorId ? [elevatorId] : undefined,
    start: startOfYear(new Date()).toISOString(),
    end: endOfYear(new Date()).toISOString(),
    pageIndex: page.pageIndex,
    pageSize: page.pageSize,
    query: search,
    status,
    types,
  });
  totalRef.current = totalRef.current || serviceOrdersResource.total;

  useEffect(() => {
    if (serviceOrdersResource.data.length) {
      setRows(makeRows(serviceOrdersResource.data));
    } else {
      setRows([]);
    }
  }, [serviceOrdersResource]);

  useEffect(() => {
    setPageCount(Math.ceil(serviceOrdersResource.total / page.pageSize));
  }, [serviceOrdersResource, page.pageSize]);

  const renderFilterItems = () => (
    <FilterFields>
      <MultipleSelectCheckmarks
        label="Order Type"
        options={Object.keys(ServiceOrderType).map((item) =>
          serviceOrderTypeToString(item),
        )}
        getSelectedValue={(item) =>
          setTypes(item.map((i) => serviceOrderTypeToEnum(i)))
        }
      />
      <MultipleSelectCheckmarks
        label="Status"
        options={[
          ServiceOrderStatus.READY_TO_SCHEDULE,
          ServiceOrderStatus.SCHEDULED,
          ServiceOrderStatus.IN_PROGRESS,
          ServiceOrderStatus.COMPLETED,
          ServiceOrderStatus.CANCELLED,
          ServiceOrderStatus.EXPIRED,
        ].map((item) => serviceOrderStatusToString(item))}
        getSelectedValue={(item) =>
          setStatus(
            item.map(
              (i) => serviceOrderStatusMap[i as serviceOrderStatusMapKey],
            ),
          )
        }
      />
    </FilterFields>
  );

  if (isFetched && !totalRef.current) {
    return (
      <EmptySection
        label="No orders yet. Please click the button above to add."
        showActionBtn
        btnLabel="Create Service Order"
        btnAction={() => navigate('/orders')}
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
          filterItems={renderFilterItems()}
        />
      }>
      <DataGridLayout
        hideFooter={pageCount <= 1}
        rows={rows}
        columns={columns}
        loading={isFetching}
        scrollToTop={search}
        pageSize={page.pageSize}
        handlePageSizeChange={(newPageSize: number) =>
          setPage({...page, pageSize: newPageSize})
        }
        handlePageChange={(newPage: number) => {
          setPage({...page, pageIndex: newPage - 1});
        }}
        pageCount={pageCount}
        totalRows={serviceOrdersResource.total}
      />
    </PageListingLayout>
  );
};
