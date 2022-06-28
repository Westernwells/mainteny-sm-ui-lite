import {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import {GridColDef, GridRowsProp} from '@mui/x-data-grid';
import {DataGridLayout, getColumnProps} from 'components/DataGridLayout';
import {SearchInput} from 'components/SearchInput';
import {Progress} from 'components/Progress';
import {useAllElevators} from 'hooks/reactQuery/useElevator';
import {ElevatorView} from 'models/elevator';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {formatDate} from 'utils/datetime';
import {NoRowsEmptySection} from './NoRowsEmptySection';
import {styles} from './style';

interface Props {
  setRowItem: (row: ElevatorView) => void;
  searchCustomer?: string;
}

export const columns: GridColDef[] = [
  getColumnProps({
    field: 'number',
    headerName: 'number',
    align: 'center',
    flex: 0,
  }),
  getColumnProps({
    field: 'model',
    headerName: 'model',
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
    field: 'lastVisit',
    headerName: 'last visit',
  }),
  getColumnProps({
    field: 'nextVisit',
    headerName: 'next visit',
  }),
];

export const makeRows = (elevators: ElevatorView[]): GridRowsProp =>
  elevators
    ? elevators.map((item, index) => ({
        id: index,
        number: item.number,
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
  const [search, setSearch] = useState(searchCustomer || '');
  const [page, setPage] = useState(makePage(0, pageSize));
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [pageCount, setPageCount] = useState(0);

  const {
    data: elevatorResource = createEmptyResource<ElevatorView>(pageSize),
    isIdle,
    isLoading,
    isFetching,
  } = useAllElevators(
    {query: search, pageIndex: page.pageIndex, pageSize: page.pageSize},
    {keepPreviousData: true},
  );

  useEffect(() => {
    setPageCount(Math.ceil(elevatorResource.total / page.pageSize));
  }, [elevatorResource, page.pageSize]);

  useEffect(() => {
    if (elevatorResource.data.length) {
      setRows(makeRows(elevatorResource.data));
    } else {
      setRows([]);
    }
  }, [elevatorResource]);

  if (isIdle || isLoading) {
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
        placeholder="search"
        onValueChanged={(value) => setSearch(value)}
      />
      <Box display="flex" flexGrow={1} sx={styles.scrollBar}>
        <DataGridLayout
          rows={rows}
          columns={columns}
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
          noRowsEmptySection={<NoRowsEmptySection placeholder="unit" />}
        />
      </Box>
    </>
  );
};
