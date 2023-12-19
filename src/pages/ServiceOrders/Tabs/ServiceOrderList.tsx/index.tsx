import Box from '@mui/material/Box';
import {Mixpanel} from 'mixpanel/mixpanel';
import {mixpanelEvents} from 'mixpanel/constants';
import {FilterFields} from 'components/FilterFields';
import {MultipleSelectCheckmarks} from 'components/MultipleSelectCheckmarks';
import {
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
  getServiceOrderStatusList,
  serviceOrderTypeToEnum,
  serviceOrderTypeToString,
  serviceOrderPaymentStatusToString,
  serviceOrderPaymentStatusToEnum,
  serviceOrderStatusToString,
  serviceOrderStatusToEnum,
} from 'utils/service-order-utils';
import {Widget} from 'components/Widget';
import {useFormatDate} from 'hooks/useFormatDate';
import {useQueryState} from 'hooks/useQueryState';
import {columns, makeRows} from './ServiceOrderDataGridProps';

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
  const [selectedOrderTypes, setSelectedOrderTypes, clearFilters] =
    useQueryState<ServiceOrderType[]>('selectedOrderTypes', {defaultValue: []});
  const textInput = useRef<HTMLInputElement>(null);
  const [currentDate] = useState(new Date());

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
    },
    {keepPreviousData: true},
  );

  totalOrederRef.current =
    totalOrederRef.current || serviceOrdersResource.total;

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

    if (textInput.current) {
      textInput.current.value = searchQuery;
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
        clearFilters();
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
        options={getServiceOrderStatusList()}
        getSelectedValue={(item) => {
          const orderStatus = item.map((i) => serviceOrderStatusToEnum(i));
          setSelectedOrderStatus(orderStatus as ServiceOrderStatus[]);
        }}
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
          Mixpanel.identifyAndTrack(mixpanelEvents.NEW_ORDER_BUTTON_CLICKED);
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
