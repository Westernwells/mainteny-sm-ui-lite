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
import {columns, makeRows} from './ServiceOrderDataGridProps';

interface Props {
  showFilter?: boolean;
  setShowFilter?: (val: boolean) => void;
}

export const ServiceOrderList = ({
  showFilter = false,
  setShowFilter = () => {},
}: Props) => {
  const [page, setPage] = useState(makePage(0, 25));
  // const [search, setSearch] = useState('');
  const [queryParams, setQueryParams] = useSearchParams();
  const [pageCount, setPageCount] = useState(0);
  const [rows, setRows] = useState<GridRowsProp>([]);
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
      query: '',
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

  const renderFilterItems = () => (
    <FilterFields showFilter={showFilter} setShowFilter={setShowFilter}>
      <MultipleSelectCheckmarks
        label="Status"
        options={Object.values(ServiceOrderStatus).map((option) =>
          _.capitalize(option).split('_').join(' '),
        )}
        getSelectedValue={(item) => {
          let orderStatus = item.map((val) =>
            val.split(' ').join('_').toUpperCase(),
          );
          if (orderStatus.includes(ServiceOrderStatus.ALL)) {
            orderStatus = [];
          }
          setSelectedOrderStatus(orderStatus as ServiceOrderStatus[]);
        }}
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

  if (isIdle || isLoading) {
    return <Progress />;
  }

  return (
    <Box sx={{flexGrow: 1, display: 'flex', flexDirection: 'column'}}>
      <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
        {renderFilterItems()}
      </Box>

      <DataGridLayout
        hideFooter={pageCount <= 1}
        rows={rows}
        columns={columns}
        loading={isFetching}
        pageSize={page.pageSize}
        pageIndex={page.pageIndex}
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
