import Box from '@mui/material/Box';
import {FilterFields} from 'components/FilterFields';
import {MultipleSelectCheckmarks} from 'components/MultipleSelectCheckmarks';
import {
  ServiceOrderOrderField,
  ServiceOrderPaymentStatus,
  ServiceOrderStatus,
  ServiceOrderType,
  ServiceOrderView,
} from 'models/service-order';
import {useEffect, useRef, useState} from 'react';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {useServiceOrders} from 'hooks/reactQuery/useServiceOrder';
import {endOfDay, startOfDay, subDays} from 'date-fns';
import {useNavigate} from 'react-router-dom';
import {DataGridLayout} from 'components/DataGridLayout';
import {GridRowsProp} from '@mui/x-data-grid';
import {Progress} from 'components/Progress';
import {EmptySection} from 'components/EmptySection';
import {FlexContainer} from 'components/FlexContainer';
import {
  serviceOrderTypeToEnum,
  serviceOrderTypeToString,
  serviceOrderPaymentStatusToString,
  serviceOrderPaymentStatusToEnum,
  serviceOrderStatusToString,
} from 'utils/service-order-utils';
import {Widget} from 'components/Widget';
import {useFormatDate} from 'hooks/useFormatDate';
import {useQueryState} from 'hooks/useQueryState';
import {Order, OrderByParams} from 'models/misc';
import {useSearchValues} from 'hooks/useSearchValues';
import {columns, makeRows} from './ServiceOrderDataGridProps';

const serviceOrderStatusMap = {
  Unscheduled: ServiceOrderStatus.READY_TO_SCHEDULE,
  Scheduling: ServiceOrderStatus.SCHEDULING,
  Pending: ServiceOrderStatus.SCHEDULED,
  Ongoing: ServiceOrderStatus.IN_PROGRESS,
  Completed: ServiceOrderStatus.COMPLETED,
  Cancelled: ServiceOrderStatus.CANCELLED,
  Expired: ServiceOrderStatus.EXPIRED,
  Overdue: ServiceOrderStatus.OVERDUE,
};
type serviceOrderStatusMapKey = keyof typeof serviceOrderStatusMap;

export const ServiceOrderList = () => {
  const navigate = useNavigate();
  const formatDate = useFormatDate();
  const [page, setPage] = useQueryState('page', {
    defaultValue: makePage(0, 25),
  });
  const [pageCount, setPageCount] = useState(0);
  const totalOrederRef = useRef(0);
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [searchQuery, setSearchQuery] = useQueryState('searchServiceOrders');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useQueryState<
    ServiceOrderPaymentStatus[]
  >('selectedPaymentStatus', {defaultValue: []});
  const [selectedOrderStatus, setSelectedOrderStatus] = useQueryState<
    ServiceOrderStatus[]
  >('selectedOrderStatus', {defaultValue: []});
  const [selectedOrderTypes, setSelectedOrderTypes] = useQueryState<
    ServiceOrderType[]
  >('selectedOrderTypes', {defaultValue: []});
  const textInput = useRef<HTMLInputElement>(null);
  const [currentDate] = useState(new Date());

  const {values, clearValues} =
    useSearchValues<OrderByParams<ServiceOrderOrderField>>();
  const {sortOrder, orderByField} = values;

  const {
    data: serviceOrdersResource = createEmptyResource<ServiceOrderView>(10),
    isFetching,
    isLoading,
    isIdle,
    isFetched,
  } = useServiceOrders(
    {
      end: endOfDay(currentDate).toISOString(),
      start: startOfDay(subDays(currentDate, 30)).toISOString(),
      pageIndex: page.pageIndex,
      pageSize: page.pageSize,
      query: searchQuery,
      status: selectedOrderStatus,
      types: selectedOrderTypes,
      paymentStatus: selectedPaymentStatus,
      orderBy: orderByField || ServiceOrderOrderField.CREATED_TIME,
      order: sortOrder || Order.DESC,
    },
    {keepPreviousData: true},
  );

  totalOrederRef.current =
    totalOrederRef.current || serviceOrdersResource.total;

  useEffect(() => {
    if (textInput.current && !textInput.current.value) {
      textInput.current.value = searchQuery;
    }
  }, []);

  useEffect(() => {
    if (
      serviceOrdersResource.total > 0 &&
      serviceOrdersResource.data.length === 0
    ) {
      setPage({
        ...page,
        pageIndex: 0,
      });
    }
  }, [
    searchQuery,
    selectedOrderTypes,
    selectedOrderStatus,
    serviceOrdersResource,
    selectedPaymentStatus,
  ]);

  useEffect(() => {
    if (!isLoading) {
      setRows(makeRows(serviceOrdersResource.data, formatDate));
    }
  }, [serviceOrdersResource]);

  useEffect(() => {
    setPageCount(Math.ceil(serviceOrdersResource.total / page.pageSize));
  }, [serviceOrdersResource, page.pageSize]);

  const renderFilterItems = () => (
    <FilterFields
      onClear={() => {
        clearValues();
        if (textInput.current) {
          textInput.current.value = '';
        }
      }}
      showFilter>
      <Box sx={{width: '100%'}}>
        <MultipleSelectCheckmarks
          label="Job Type"
          options={Object.keys(ServiceOrderType).map((i) =>
            serviceOrderTypeToString(i),
          )}
          initialSelectedItems={selectedOrderTypes.map((i) =>
            serviceOrderTypeToString(i),
          )}
          getSelectedValue={(item) => {
            const orderTypes = item.map((i) => serviceOrderTypeToEnum(i));
            setSelectedOrderTypes(orderTypes as ServiceOrderType[]);
          }}
          multiple
        />
      </Box>

      <MultipleSelectCheckmarks
        label="Job Status"
        options={[
          ServiceOrderStatus.READY_TO_SCHEDULE,
          ServiceOrderStatus.SCHEDULING,
          ServiceOrderStatus.SCHEDULED,
          ServiceOrderStatus.IN_PROGRESS,
          ServiceOrderStatus.COMPLETED,
          ServiceOrderStatus.CANCELLED,
          ServiceOrderStatus.OVERDUE,
        ].map((item) => serviceOrderStatusToString(item))}
        getSelectedValue={(item) =>
          setSelectedOrderStatus(
            item.map(
              (i) => serviceOrderStatusMap[i as serviceOrderStatusMapKey],
            ),
          )
        }
        initialSelectedItems={selectedOrderStatus.map((i) =>
          serviceOrderStatusToString(i),
        )}
        multiple
      />

      <MultipleSelectCheckmarks
        label="Payment Status"
        options={Object.values(ServiceOrderPaymentStatus).map((value) =>
          serviceOrderPaymentStatusToString(value),
        )}
        getSelectedValue={(item) => {
          const paymentStatus = item.map((i) =>
            serviceOrderPaymentStatusToEnum(i),
          );
          setSelectedPaymentStatus(
            paymentStatus as ServiceOrderPaymentStatus[],
          );
        }}
        initialSelectedItems={selectedPaymentStatus.map((i) =>
          serviceOrderPaymentStatusToString(i),
        )}
        multiple
      />
    </FilterFields>
  );

  const renderWidget = () => (
    <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
      <Widget
        searchPlaceholder="Search order type, customer, address etc."
        getSearchValue={(search) => setSearchQuery(search)}
        filterItems={renderFilterItems()}
        refInput={textInput}
      />
    </Box>
  );

  if (isFetched && !totalOrederRef.current) {
    return (
      <EmptySection
        label="No orders yet. Please click the button above to add."
        showActionBtn
        btnLabel="Add Service Job"
        btnAction={() => {
          navigate('/orders/new?type=regular');
        }}
        containerStyle={{
          height: '100%',
          mb: '10em',
        }}
      />
    );
  }

  if (isIdle || isLoading) {
    return <Progress />;
  }

  return (
    <FlexContainer>
      {renderWidget()}
      <DataGridLayout
        rows={rows}
        columns={columns}
        aria-label="jobs-grid"
        loading={isFetching}
        pageSize={page.pageSize}
        scrollToTop={searchQuery}
        pageIndex={pageCount < page.pageIndex ? 0 : page.pageIndex + 1 || 1}
        handlePageSizeChange={(newPageSize: number) =>
          setPage({
            ...page,
            pageSize: newPageSize,
          })
        }
        handlePageChange={(newPage: number) => {
          setPage({
            ...page,
            pageIndex: newPage - 1,
          });
        }}
        pageCount={pageCount}
        totalRows={serviceOrdersResource.total}
      />
    </FlexContainer>
  );
};
