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
    field: 'name',
    headerName: 'customer',
    cellClassName: 'truncateText',
    flex: 1,
  }),
  getColumnProps({
    field: 'number',
    headerName: 'customer no.',
    align: 'center',
    flex: 1,
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
    align: 'center',
    flex: 1,
  }),
  getColumnProps({
    field: 'phone',
    headerName: 'phone no.',
    align: 'right',
  }),
];

export const makeRows = (customers: PropertyOwnerView[]): GridRowsProp =>
  customers
    ? customers.map((item, index) => ({
        id: index,
        name: item.name,
        number: item.externalId,
        address: item.postalAddress?.fullName,
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
    refetch,
  } = useQueryCustomers(
    {
      pageIndex: page.pageIndex,
      pageSize: page.pageSize,
      query: encodeURIComponent(search!!),
    },
    {
      keepPreviousData: true,
      enabled: false,
    },
  );

  useEffect(() => {
    setPageCount(Math.ceil(customerResource.total / page.pageSize));
  }, [customerResource, page.pageSize]);

  useEffect(() => {
    if (!isIdle && !isLoading) {
      setRows(makeRows(customerResource.data));
    }
  }, [isFetching]);

  useEffect(() => {
    if (page.pageIndex && search !== '') {
      setPage({...page, pageIndex: 0});
    }

    if (search === '' || (search !== '' && page.pageIndex === 0)) {
      refetch();
    }
  }, [page.pageIndex, search]);

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
        variant="outlined"
        label="Search"
        placeholder="Search by number, name, address etc."
        onValueChanged={(value) => setSearch(value)}
      />
      <Box display="flex" flexGrow={1} sx={styles.scrollBar}>
        <DataGridLayout
          rows={rows}
          columns={columns}
          scrollToTop={search}
          onCellClick={(params) => setRowItem(params.row.propertyOwner)}
          loading={isFetching}
          pageSize={page.pageSize}
          pageIndex={page.pageIndex + 1}
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
              placeholder="customer"
              action={() => window.open('/customers/new', '_blank')}
            />
          }
        />
      </Box>
    </>
  );
};
