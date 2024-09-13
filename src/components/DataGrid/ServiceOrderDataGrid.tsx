import React, {useEffect, useState} from 'react';
import {GridColDef, GridRenderCellParams, GridRowsProp} from '@mui/x-data-grid';
import {endOfYear, startOfYear} from 'date-fns';
import Box from '@mui/material/Box';
import {DataGridLayout, getColumnProps} from 'components/DataGridLayout';
import {SearchInput} from 'components/SearchInput';
import {ServiceOrderIcons} from 'components/ServiceOrderIcons';
import {ServiceOrderTypeText} from 'components/ServiceOrderTypeText';
import {StatusChip} from 'components/StatusChip';
import {useServiceOrders} from 'hooks/reactQuery/useServiceOrder';
import {ServiceOrderOrderField, ServiceOrderView} from 'models/service-order';
import {createEmptyResource, makePage} from 'utils/paging';
import {
  getServiceOrderStatusColor,
  serviceOrderStatusToString,
} from 'utils/service-order-utils';
import {
  PropertyOwnerSimpleView,
  PropertyOwnerView,
} from 'models/propertyManager';
import {EmptySection} from 'components/EmptySection';
import {useTranslation} from 'react-i18next';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {styles} from './style';
import {Order} from '../../models/pagination';

interface Props {
  setRowItem: (row: ServiceOrderView) => void;
  selectedCustomer?: PropertyOwnerView | PropertyOwnerSimpleView;
  elevatorId?: string;
}

export const columns: GridColDef[] = [
  getColumnProps({
    field: 'number',
    headerName: 'job number',
  }),
  getColumnProps({
    field: 'customer',
    headerName: 'customer',
    cellClassName: 'truncateText',
    flex: 1,
  }),
  getColumnProps({
    field: 'address',
    headerName: 'address',
    cellClassName: 'truncateText',
    flex: 1.5,
  }),
  getColumnProps({
    field: 'type',
    headerName: 'job type',
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
        number: item.externalId, // rename field when redoing table row
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
  elevatorId,
  selectedCustomer,
}: Props) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(makePage(0, pageSize));
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [pageCount, setPageCount] = useState(0);
  const {t} = useTranslation();

  const {
    data: serviceOrdersResource = createEmptyResource<ServiceOrderView>(
      pageSize,
    ),
    isLoading,
    isFetching,
  } = useServiceOrders(
    {
      elevatorIds: elevatorId ? [elevatorId] : [],
      start: startOfYear(new Date(2000, 1, 1)).toISOString(),
      end: endOfYear(new Date()).toISOString(),
      pageIndex: page.pageIndex,
      pageSize: page.pageSize,
      query: search,
      order: Order.DESC,
      orderBy: ServiceOrderOrderField.CREATED_TIME,
    },
    {keepPreviousData: true},
  );

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
          pageIndex={page.pageIndex + 1}
          pageCount={pageCount}
          handlePageChange={(value) =>
            setPage((prev) => ({
              ...prev,
              pageIndex: value - 1,
            }))
          }
          noRowsEmptySection={
            <EmptySection
              illustration="clipboard"
              size="tiny"
              containerStyle={{
                width: '60%',
                m: 'auto',
                paddingTop: '50px',
              }}
              label={t('Add a unit and create your first job')}
              subLabel={t(
                "Once you have units for this customer, you'll be able to create jobs and generate invoices for them",
              )}
              showActionBtn
              actionButtonIcon={<div />}
              actionButtonEndIcon={<ArrowForwardIcon />}
              btnLabel={t('Get Started')}
              btnAction={() => {
                if (selectedCustomer) {
                  const localSelectedCustomer =
                    selectedCustomer as PropertyOwnerView;

                  if (localSelectedCustomer.unitNumber === 0) {
                    window.open(
                      `/units/new?customer=${selectedCustomer.id}`,
                      '_blank',
                    );
                    return;
                  }
                }

                window.open('/orders/new?type=regular', '_blank');
              }}
            />
          }
        />
      </Box>
    </>
  );
};
