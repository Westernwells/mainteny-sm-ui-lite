import {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import {GridColDef, GridRowsProp} from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import NewCustomer from 'pages/InvoiceDetails/NewCustomer';
import {DataGridLayout, getColumnProps} from 'components/DataGridLayout';
import {SearchInput} from 'components/SearchInput';
import {Progress} from 'components/Progress';
import {Button} from 'components/Button';
import {useQueryCustomers} from 'hooks/reactQuery/useCustomers';
import {
  PropertyOwnerOrderField,
  PropertyOwnerView,
} from 'models/propertyManager';
import {Order} from 'models/misc';
import {createEmptyResource, makePage} from 'utils/paging';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {useCompanyXeroInfo} from 'hooks/reactQuery/useCompanies';
import useLastSyncedItem from 'hooks/useLastSyncedItem';
import {DataSyncType} from 'models/service-company';
import {styles} from './style';
import {NoRowsEmptySection} from './NoRowsEmptySection';

interface Props {
  setRowItem: (row: PropertyOwnerView) => void;
}

export const columns: GridColDef[] = [
  getColumnProps({
    field: 'name',
    headerName: 'customer',
    cellClassName: 'truncateText',
  }),
  getColumnProps({
    field: 'number',
    headerName: 'customer no.',
    align: 'right',
  }),
  getColumnProps({
    field: 'billingAddress',
    headerName: 'billing address',
    cellClassName: 'truncateText',
    flex: 1.5,
  }),
  getColumnProps({
    field: 'beneficiaryAddress',
    headerName: 'beneficiary address',
    cellClassName: 'truncateText',
    flex: 1.5,
  }),
];

export const makeRows = (customers: PropertyOwnerView[]): GridRowsProp =>
  customers
    ? customers.map((item, index) => ({
        id: index,
        name: item.name,
        number: item.externalId,
        billingAddress: item.billingAddress?.fullName,
        beneficiaryAddress: item.beneficiaryAddress?.fullName,
        units: item.unitNumber,
        phone: item.contact.phone,
        propertyOwner: item,
      }))
    : [];

const pageSize = 25;

export const CustomersDataGrid = ({setRowItem}: Props) => {
  const {user} = useUserSession();
  const [isAddNewCustomerDialogOpen, setIsAddNewCustomerDialogOpen] =
    useState<boolean>(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(makePage(0, pageSize));
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [pageCount, setPageCount] = useState(0);

  const {data: xeroInfoData} = useCompanyXeroInfo(
    user?.userAccount.serviceCompany.id,
  );
  const {lastSyncedText} = useLastSyncedItem({
    syncType: DataSyncType.PROPERTY_OWNER,
  });

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
      order: Order.DESC,
      orderBy: PropertyOwnerOrderField.CREATED_TIME,
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
    if (search === '' || (search !== '' && page.pageIndex === 0)) {
      refetch();
    }
  }, [search, page.pageIndex]);

  useEffect(() => {
    if (page.pageIndex) {
      setPage({...page, pageIndex: 0});
    }
  }, [search]);

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
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <SearchInput
          variant="outlined"
          label="Search"
          placeholder="Search by number, name, address etc."
          onValueChanged={(value) => setSearch(value)}
        />
        <Button
          label="Add New Customer"
          buttonProps={{
            size: 'small',
            startIcon: <AddIcon />,
            onClick: () => setIsAddNewCustomerDialogOpen(true),
            variant: 'outlined',
            sx: {
              background: 'transparent',
            },
          }}
        />
      </Box>
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
          lastSyncedText={xeroInfoData?.enabled ? lastSyncedText : ''}
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
          containerStyle={{
            '& .MuiDataGrid-columnHeader, & .MuiDataGrid-cell': {
              padding: '0 1.75rem',
            },
          }}
        />
      </Box>
      <NewCustomer
        isDialogOpen={isAddNewCustomerDialogOpen}
        onClose={() => setIsAddNewCustomerDialogOpen(false)}
        onSave={() => setIsAddNewCustomerDialogOpen(false)}
      />
    </>
  );
};
