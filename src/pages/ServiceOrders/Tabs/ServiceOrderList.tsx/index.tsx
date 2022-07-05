import Box from '@mui/material/Box';
import {useTranslation} from 'react-i18next';
import {FilterFields} from 'components/FilterFields';
import {MultipleSelectCheckmarks} from 'components/MultipleSelectCheckmarks';
import {
  ServiceOrderStatus,
  ServiceOrderType,
  ServiceOrderView,
} from 'models/service-order';
import {useEffect, useRef, useState} from 'react';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {useServiceOrders} from 'hooks/reactQuery/useServiceOrder';
import {endOfDay, startOfDay, subDays} from 'date-fns';
import {useSearchParams} from 'react-router-dom';
import {DataGridLayout} from 'components/DataGridLayout';
import {GridRowsProp} from '@mui/x-data-grid';
import {
  formatSearchParamsPageIndex,
  formatSearchParamsPageSize,
} from 'utils/utils';
import {Progress} from 'components/Progress';
import {EmptySection} from 'components/EmptySection';
import {FlexContainer} from 'components/FlexContainer';
import {
  getServiceOrderStatusList,
  getSelectedOrderStatuses,
  serviceOrderTypeToEnum,
  serviceOrderTypeToString,
} from 'utils/service-order-utils';
import {Widget} from 'components/Widget';
import {columns, makeRows} from './ServiceOrderDataGridProps';

export const ServiceOrderList = () => {
  const {t} = useTranslation();
  const [page, setPage] = useState(makePage(0, 25));
  const [queryParams, setQueryParams] = useSearchParams();
  const [pageCount, setPageCount] = useState(0);
  const totalOrederRef = useRef(0);
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<
    ServiceOrderStatus[]
  >([]);
  const [selectedOrderTypes, setSelectedOrderTypes] = useState<
    ServiceOrderType[]
  >([]);

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
    },
    {keepPreviousData: true},
  );

  totalOrederRef.current =
    totalOrederRef.current || serviceOrdersResource.total;

  // useEffect(() => {
  //   const currentParams = Object.fromEntries([...queryParams]);
  //   setPage({
  //     ...page,
  //     pageSize: Number(currentParams.pageSize),
  //     pageIndex: Number(currentParams.pageIndex) - 1,
  //   });
  // }, [queryParams]);

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
      setRows(makeRows(serviceOrdersResource.data));
    }
  }, [serviceOrdersResource]);

  useEffect(() => {
    setPageCount(Math.ceil(serviceOrdersResource.total / page.pageSize));
  }, [serviceOrdersResource, page.pageSize]);

  const getSelectedStatusValues = (items: string[]) => {
    const selectedOrderStatuses = getSelectedOrderStatuses(items);
    setSelectedOrderStatus(selectedOrderStatuses as ServiceOrderStatus[]);
  };

  const renderFilterItems = () => (
    <FilterFields
      onClear={() => {
        setSelectedOrderStatus([]);
        setSelectedOrderTypes([]);
      }}
      showFilter>
      <MultipleSelectCheckmarks
        label="Status"
        options={getServiceOrderStatusList()}
        getSelectedValue={getSelectedStatusValues}
        initialSelectedItems={selectedOrderStatus}
        multiple
      />

      <MultipleSelectCheckmarks
        label="Order types"
        options={Object.keys(ServiceOrderType).map((i) =>
          t(serviceOrderTypeToString(i)),
        )}
        initialSelectedItems={selectedOrderTypes}
        getSelectedValue={(item) => {
          const orderTypes = item.map((i) => serviceOrderTypeToEnum(i));

          setSelectedOrderTypes(orderTypes as ServiceOrderType[]);
        }}
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
      />
    </Box>
  );

  if (isFetched && !totalOrederRef.current) {
    return (
      <EmptySection
        label="No orders have been created yet. Please click the button above to create one!"
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
        hideFooter={pageCount <= 1}
        rows={rows}
        columns={columns}
        loading={isFetching}
        pageSize={page.pageSize}
        scrollToTop={searchQuery}
        pageIndex={page.pageIndex + 1}
        handlePageSizeChange={(newPageSize: number) =>
          setQueryParams(formatSearchParamsPageSize(newPageSize, queryParams))
        }
        handlePageChange={(newPage: number) =>
          setQueryParams(formatSearchParamsPageIndex(newPage, queryParams))
        }
        pageCount={pageCount}
        totalRows={serviceOrdersResource.total}
      />
    </FlexContainer>
  );
};
