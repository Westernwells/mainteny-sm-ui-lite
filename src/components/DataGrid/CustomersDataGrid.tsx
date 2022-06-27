import {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import {GridColDef, GridRowsProp} from '@mui/x-data-grid';
import {DataGridLayout, getColumnProps} from 'components/DataGridLayout';
import {SearchInput} from 'components/SearchInput';
import {Progress} from 'components/Progress';
import {useQueryCustomers} from 'hooks/reactQuery/useCustomers';
import {PropertyOwnerView} from 'models/propertyManager';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {NoRowsEmptySection} from './NoRowsEmptySection';
import {styles} from './style';

interface Props {
  setRowItem: (row: PropertyOwnerView) => void;
}

export const columns: GridColDef[] = [
  getColumnProps({
    field: 'number',
    headerName: 'number',
    align: 'center',
    flex: 0,
  }),
  getColumnProps({
    field: 'name',
    headerName: 'name',
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
    field: 'units',
    headerName: 'no. of units',
    align: 'right',
    flex: 0,
  }),
  getColumnProps({
    field: 'phone',
    headerName: 'phone',
  }),
];

export const makeRows = (customers: PropertyOwnerView[]): GridRowsProp =>
  customers
    ? customers.map((item, index) => ({
        id: index,
        name: item.name,
        // TODO: Use Customer number
        number: 'C-12345',
        address: item.postalAddress.fullName,
        units: item.unitNumber,
        phone: item.contact.phone,
        propertyOwner: item,
      }))
    : [];

const pageSize = 25;

export const CustomersDataGrid = ({setRowItem}: Props) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(makePage(0, pageSize));
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [pageCount, setPageCount] = useState(0);

  const {
    data: customerResource = createEmptyResource<PropertyOwnerView>(pageSize),
    isLoading,
    isFetching,
    isIdle,
  } = useQueryCustomers(
    {
      pageIndex: page.pageIndex,
      pageSize: page.pageSize,
      query: search,
    },
    {keepPreviousData: true},
  );

  useEffect(() => {
    setPageCount(Math.ceil(customerResource.total / page.pageSize));
  }, [customerResource, page.pageSize]);

  useEffect(() => {
    setRows(makeRows(customerResource.data));
  }, [customerResource]);

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
          onCellClick={(params) => setRowItem(params.row.propertyOwner)}
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
          noRowsEmptySection={<NoRowsEmptySection placeholder="customer" />}
        />
      </Box>
    </>
  );
};
