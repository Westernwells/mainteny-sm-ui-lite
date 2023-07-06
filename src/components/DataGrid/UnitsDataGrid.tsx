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
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {useFormatDate} from 'hooks/useFormatDate';
import {NoRowsEmptySection} from './NoRowsEmptySection';
import {styles} from './style';

interface Props {
  setRowItem: (row: ElevatorView) => void;
  searchCustomer?: string;
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
    headerName: 'address',
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

export const UnitsDataGrid = ({setRowItem, searchCustomer}: Props) => {
  const formatDate = useFormatDate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(makePage(0, pageSize));
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [pageCount, setPageCount] = useState(0);

  const {data: elevatorResource = createEmptyResource<ElevatorView>(pageSize)} =
    useAllElevators(
      {
        query: searchCustomer,
        pageIndex: page.pageIndex,
        pageSize: page.pageSize,
      },
      {keepPreviousData: true},
    );

  const {
    data: customerElevatorResource = createEmptyResource<ElevatorView>(500),
    isIdle,
    isLoading,
    isFetching,
    isSuccess,
  } = useQueryCustomerElevator(
    {query: search, pageIndex: 0, pageSize: 500},
    {},
    elevatorResource.data && elevatorResource.data[0]?.propertyOwner?.id,
    {keepPreviousData: true},
  );

  useEffect(() => {
    setPageCount(Math.ceil(customerElevatorResource.total / page.pageSize));
  }, [customerElevatorResource, page.pageSize]);

  useEffect(() => {
    if (customerElevatorResource.data.length) {
      setRows(makeRows(customerElevatorResource.data, formatDate));
    } else {
      setRows([]);
    }
  }, [customerElevatorResource]);

  if ((isIdle || isLoading) && isSuccess) {
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
          loading={isFetching}
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
              placeholder="unit"
              action={() => window.open('/units/new', '_blank')}
            />
          }
        />
      </Box>
    </>
  );
};
