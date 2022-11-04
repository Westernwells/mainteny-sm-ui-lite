import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {GridColDef, GridRenderCellParams, GridRowsProp} from '@mui/x-data-grid';
import {endOfYear, startOfYear} from 'date-fns';
import Box from '@mui/material/Box';
import {DataGridLayout, getColumnProps} from 'components/DataGridLayout';
import {SearchInput} from 'components/SearchInput';
import {ServiceOrderIcons} from 'components/ServiceOrderIcons';
import {ServiceOrderTypeText} from 'components/ServiceOrderTypeText';
import {StatusChip} from 'components/StatusChip';
import {useServiceOrders} from 'hooks/reactQuery/useServiceOrder';
import {ServiceOrderView} from 'models/service-order';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {
  getServiceOrderStatusColor,
  serviceOrderStatusToString,
} from 'utils/service-order-utils';
import {NoRowsEmptySection} from './NoRowsEmptySection';
import {styles} from './style';

interface Props {
  setRowItem: (row: ServiceOrderView) => void;
  searchCustomer?: string;
  elevatorId?: string;
}

export const columns: GridColDef[] = [
  getColumnProps({
    field: 'number',
    headerName: 'order number',
    align: 'center',
    flex: 0,
  }),
  getColumnProps({
    field: 'customer',
    headerName: 'customer',
    cellClassName: 'truncateText',
    flex: 1.5,
  }),
  getColumnProps({
    field: 'address',
    headerName: 'address',
    cellClassName: 'truncateText',
    flex: 1.5,
  }),
  getColumnProps({
    field: 'type',
    headerName: 'order type',
    renderCell: (params: GridRenderCellParams<any, any, any>) => (
      <>
        <ServiceOrderIcons serviceOrderType={params.row.type} size="small" />
        <ServiceOrderTypeText
          serviceOrderType={params.row.type}
          capitalizeText
          variant="body2"
        />
      </>
    ),
  }),
  getColumnProps({
    field: 'status',
    headerName: 'status',
    align: 'center',
    renderCell: (params: GridRenderCellParams<any, any, any>) => (
      <StatusChip
        color={getServiceOrderStatusColor(params.value)}
        label={serviceOrderStatusToString(params.value)}
      />
    ),
    flex: 0.75,
  }),
];

export const makeRows = (orders: ServiceOrderView[]): GridRowsProp =>
  orders
    ? orders.map((item, index) => ({
        id: index,
        number: item.number,
        customer: item.elevator.propertyOwner.name,
        address: item.elevator.address.fullName,
        type: item.type,
        status: item.status,
        serviceOrder: item,
      }))
    : [];

const pageSize = 25;

export const ServiceOrdersDataGrid = ({
  setRowItem,
  searchCustomer,
  elevatorId,
}: Props) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState(searchCustomer || '');
  const [page, setPage] = useState(makePage(0, pageSize));
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [pageCount, setPageCount] = useState(0);

  const {
    data: serviceOrdersResource = createEmptyResource<ServiceOrderView>(
      pageSize,
    ),
    isLoading,
    isFetching,
  } = useServiceOrders({
    elevatorIds: elevatorId ? [elevatorId] : [],
    start: startOfYear(new Date(2000, 1, 1)).toISOString(),
    end: endOfYear(new Date()).toISOString(),
    pageIndex: page.pageIndex,
    pageSize: page.pageSize,
    query: search,
  });

  useEffect(() => {
    setPageCount(Math.ceil(serviceOrdersResource.total / page.pageSize));
  }, [serviceOrdersResource, page.pageSize]);

  useEffect(() => {
    if (serviceOrdersResource.data.length) {
      setRows(makeRows(serviceOrdersResource.data));
    } else {
      setRows([]);
    }
  }, [serviceOrdersResource]);

  return (
    <>
      <SearchInput
        variant="outlined"
        label="Search"
        placeholder="Search by number, customer, status etc."
        onValueChanged={(value) => setSearch(value)}
      />
      <Box display="flex" flexGrow={1} sx={styles.scrollBar}>
        <DataGridLayout
          rows={rows}
          columns={columns}
          scrollToTop={search}
          onCellClick={(params) => setRowItem(params.row.serviceOrder)}
          loading={isFetching || isLoading}
          pageSize={page.pageSize}
          pageIndex={page.pageIndex}
          pageCount={pageCount}
          hideFooter={pageCount <= 1}
          handlePageChange={(value) =>
            setPage((prev) => ({
              ...prev,
              pageIndex: value - 1,
            }))
          }
          noRowsEmptySection={
            <NoRowsEmptySection
              placeholder="service order"
              action={() => navigate('/orders/new?type=regular')}
            />
          }
        />
      </Box>
    </>
  );
};
