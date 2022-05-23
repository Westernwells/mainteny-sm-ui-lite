import {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  GridAlignment,
  GridColDef,
  GridColumnHeaderParams,
  GridRenderCellParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import {DataGridLayout} from 'components/DataGridLayout';
import {SearchInput} from 'components/SearchInput';
import {Progress} from 'components/Progress';
import {
  useFetchCustomerElevatorNumbers,
  useQueryCustomers,
} from 'hooks/reactQuery/useCustomers';
import {PropertyOwner} from 'models/propertyManager';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {NoRowsEmptySection} from './NoRowsEmptySection';
import {styles} from './style';

interface Props {
  setRowItem: (row: PropertyOwner) => void;
}

const defaultProps = {
  editable: false,
  renderHeader: (params: GridColumnHeaderParams) => (
    <Typography variant="subtitle2" color="textSecondary">
      {params.colDef.headerName}
    </Typography>
  ),
  renderCell: (params: GridRenderCellParams<any, any, any>) => (
    <Typography variant="body2" mx="0.5em">
      {params.value || '-'}
    </Typography>
  ),
};
const defaultAlignment: {
  flex: number;
  headerAlign: GridAlignment;
  align: GridAlignment;
} = {
  flex: 1,
  headerAlign: 'center',
  align: 'center',
};

export const columns: GridColDef[] = [
  {
    field: 'name',
    headerName: 'NAME',
    type: 'string',
    flex: 2,
    headerAlign: 'left',
    cellClassName: 'truncateText',
    ...defaultProps,
  },
  {
    field: 'number',
    headerName: 'CUSTOMER NO.',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'address',
    headerName: 'ADDRESS',
    type: 'string',
    flex: 2,
    headerAlign: 'left',
    cellClassName: 'truncateText',
    ...defaultProps,
  },
  {
    field: 'units',
    headerName: 'NO OF UNITS',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'phone',
    headerName: 'PHONE NO.',
    type: 'string',
    cellClassName: 'nowrap',
    ...defaultAlignment,
    ...defaultProps,
  },
];

export const makeRows = (customers: PropertyOwner[]): GridRowsProp =>
  customers
    ? customers.map((item, index) => ({
        id: index,
        name: item.name,
        // TODO: Use Customer number
        number: 'C-12345',
        address: item.address.fullName,
        units: item.units,
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
    data: customerResource = createEmptyResource<PropertyOwner>(pageSize),
  } = useQueryCustomers(
    {
      pageIndex: page.pageIndex,
      pageSize: page.pageSize,
      query: search,
    },
    {keepPreviousData: true},
  );

  const {
    data: customersWithUnits,
    isIdle,
    isLoading,
    isFetching,
  } = useFetchCustomerElevatorNumbers(customerResource.data, {
    keepPreviousData: true,
  });

  useEffect(() => {
    setPageCount(Math.ceil(customerResource.total / page.pageSize));
  }, [customerResource, page.pageSize]);

  useEffect(() => {
    if (customersWithUnits) {
      setRows(makeRows(customersWithUnits));
    } else {
      setRows([]);
    }
  }, [customersWithUnits]);

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
