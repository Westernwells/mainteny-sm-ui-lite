import {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import {GridColDef, GridRowsProp} from '@mui/x-data-grid';
import {DataGridLayout, getColumnProps} from 'components/DataGridLayout';
import {SearchInput} from 'components/SearchInput';
import {Progress} from 'components/Progress';
import {
  useAllElevators,
  useQueryCustomerElevator,
} from 'hooks/reactQuery/useElevator';
import {ElevatorView} from 'models/elevator';
import {FormatDate} from 'models/misc';
import {createEmptyResource, makePage} from 'utils/paging';
import {useFormatDate} from 'hooks/useFormatDate';
import {NoRowsEmptySection} from './NoRowsEmptySection';
import {styles} from './style';

interface Props {
  setRowItem: (row: ElevatorView) => void;
  searchCustomer?: string;
  propertyOwnerId?: string;
}

export const columns: GridColDef[] = [
  getColumnProps({
    field: 'number',
    headerName: 'unit number',
    flex: 1,
  }),
  getColumnProps({
    field: 'model',
    headerName: 'model',
  }),
  getColumnProps({
    field: 'customer',
    headerName: 'customer',
    cellClassName: 'truncateText',
    flex: 1,
  }),
  getColumnProps({
    field: 'address',
    headerName: 'unit address',
    cellClassName: 'truncateText',
    flex: 1.5,
  }),
];

export const makeRows = (
  elevators: ElevatorView[],
  formatDate: FormatDate = () => '',
): GridRowsProp =>
  elevators
    ? elevators.map((item, index) => ({
        id: index,
        number: item.externalId,
        model: item.model,
        customer: item.propertyOwner.name,
        address: item.address.fullName,
        lastVisit: formatDate(item.lastVisitDate),
        nextVisit: formatDate(item.nextVisitDate),
        elevator: item,
      }))
    : [];

const pageSize = 25;

export const UnitsDataGrid = ({
  setRowItem,
  searchCustomer,
  propertyOwnerId,
}: Props) => {
  const formatDate = useFormatDate();
  const [search, setSearch] = useState(searchCustomer || '');
  const [page, setPage] = useState(makePage(0, pageSize));
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [pageCount, setPageCount] = useState(0);

  const {
    data: customerResource = createEmptyResource<ElevatorView>(pageSize),
    isFetching: isCustomerFetching,
    isLoading: isCustomerLoading,
  } = useQueryCustomerElevator(
    {
      query: encodeURIComponent(search!!),
      pageIndex: page.pageIndex,
      pageSize: page.pageSize,
    },
    {},
    propertyOwnerId,
    {keepPreviousData: true},
  );

  const {
    data: elevatorResource = createEmptyResource<ElevatorView>(pageSize),
    isLoading: isElevatorLoading,
    isFetching: isElevatorFetching,
    refetch: refetchElevatorResource,
  } = useAllElevators(
    {
      query: encodeURIComponent(search!!),
      pageIndex: page.pageIndex,
      pageSize: page.pageSize,
    },
    {keepPreviousData: true, enabled: false},
  );

  useEffect(() => {
    setPageCount(
      Math.ceil(
        propertyOwnerId
          ? customerResource.total / page.pageSize
          : elevatorResource.total / page.pageSize,
      ),
    );
  }, [elevatorResource, customerResource, page.pageSize]);

  useEffect(() => {
    if (elevatorResource.data.length || customerResource.data.length) {
      setRows(
        makeRows(
          propertyOwnerId ? customerResource.data : elevatorResource.data,
          formatDate,
        ),
      );
    } else {
      setRows([]);
    }
  }, [isElevatorFetching, isCustomerFetching, propertyOwnerId, search]);

  useEffect(() => {
    if (search === '' || (search !== '' && page.pageIndex !== 0)) {
      refetchElevatorResource();
    }
  }, [search, page.pageIndex]);

  useEffect(() => {
    if (page.pageIndex) {
      setPage({...page, pageIndex: 0});
    }
  }, [search]);

  if (isCustomerLoading || isElevatorLoading) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexGrow={1}>
        <Progress height="100%" />
      </Box>
    );
  }

  return (
    <>
      <SearchInput
        variant="outlined"
        label="Search"
        placeholder="Search by number, model, customer, address etc."
        onValueChanged={(value) => setSearch(value)}
      />
      <Box display="flex" flexGrow={1} sx={styles.scrollBar}>
        <DataGridLayout
          rows={rows}
          columns={columns}
          scrollToTop={search}
          onCellClick={(params) => setRowItem(params.row.elevator)}
          loading={isCustomerFetching}
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
            <NoRowsEmptySection
              placeholder="unit"
              action={() => window.open('/units/new', '_blank')}
            />
          }
        />
      </Box>
    </>
  );
};
