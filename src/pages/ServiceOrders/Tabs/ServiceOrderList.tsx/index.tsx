/* eslint-disable */
import Box from '@mui/material/Box';
import {FilterFields} from 'components/FilterFields';
import * as _ from 'lodash';
import {MultipleSelectCheckmarks} from 'components/MultipleSelectCheckmarks';
import {
  ServiceOrderStatus,
  ServiceOrderType,
  ServiceOrderView,
} from 'models/service-order';
import {useEffect, useState} from 'react';
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
import {
  serviceOrderStatusToEnum,
  serviceOrderStatusToString,
} from 'utils/service-order-utils';
import {Widget} from 'components/Widget';
import {columns, makeRows} from './ServiceOrderDataGridProps';

export const ServiceOrderList = () => {
  const [page, setPage] = useState(makePage(0, 25));
  // const [search, setSearchQuery] = useState('');
  const [queryParams, setQueryParams] = useSearchParams();
  const [pageCount, setPageCount] = useState(0);
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

  useEffect(() => {
    const currentParams = Object.fromEntries([...queryParams]);
    setPage({
      ...page,
      pageSize: Number(currentParams.pageSize),
      pageIndex: Number(currentParams.pageIndex) - 1,
    });
  }, [queryParams]);

  useEffect(() => {
    setRows(makeRows(serviceOrdersResource.data));
  }, [serviceOrdersResource]);

  useEffect(() => {
    setPageCount(Math.ceil(serviceOrdersResource.total / page.pageSize));
  }, [serviceOrdersResource, page.pageSize]);

  const renderServiceOrderStatusList = () => {
    let mappedOptions: string[] = [];
    Object.values(ServiceOrderStatus).forEach((option) => {
      const val = serviceOrderStatusToString(option);
      if (!mappedOptions.includes(val)) {
        mappedOptions = [...mappedOptions, val];
      }
    });
    return mappedOptions;
  };

  const getSelectedStatusValues = (items: string[]) => {
    let orderStatus: ServiceOrderStatus[] = [];
    items.forEach((val) => {
      if (val === 'Unscheduled') {
        orderStatus = [
          ...orderStatus,
          ServiceOrderStatus.INIT,
          ServiceOrderStatus.READY_TO_SCHEDULE,
          ServiceOrderStatus.SCHEDULING,
        ];
      } else {
        orderStatus = [
          ...orderStatus,
          serviceOrderStatusToEnum(val) as ServiceOrderStatus,
        ];
      }
    });
    if (orderStatus.includes(ServiceOrderStatus.ALL)) {
      orderStatus = [];
    }
    setSelectedOrderStatus(orderStatus as ServiceOrderStatus[]);
  };

  const renderFilterItems = () => (
    <FilterFields hideClear showFilter>
      <MultipleSelectCheckmarks
        label="Status"
        options={renderServiceOrderStatusList()}
        getSelectedValue={getSelectedStatusValues}
        multiple
      />

      <MultipleSelectCheckmarks
        label="Order types"
        options={Object.values(ServiceOrderType).map((option) =>
          _.capitalize(option).split('_').join(' '),
        )}
        getSelectedValue={(item) => {
          const orderTypes = item.map((val) =>
            val.split(' ').join('_').toUpperCase(),
          );

          setSelectedOrderTypes(orderTypes as ServiceOrderType[]);
        }}
        multiple
      />
    </FilterFields>
  );

  const renderWidget = () => (
    <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
      <Widget
        searchPlaceholder="Search order type, customer, address"
        getSearchValue={(search) => setSearchQuery(search)}
        hideViewOption
        filterItems={renderFilterItems()}
      />
    </Box>
  );

  if (isIdle || isLoading) {
    return <Progress />;
  }

  return (
    <Box sx={{flexGrow: 1, display: 'flex', flexDirection: 'column'}}>
      {renderWidget()}

      <DataGridLayout
        hideFooter={pageCount <= 1}
        rows={rows}
        columns={columns}
        loading={isFetching}
        pageSize={page.pageSize}
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
    </Box>
  );
};
