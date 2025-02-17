import {useEffect, useState} from 'react';
import {LinearProgress, Typography} from '@mui/material';
import Box from '@mui/material/Box';
import {GridColDef, GridRenderCellParams, GridRowsProp} from '@mui/x-data-grid';
import {DataGridLayout, getColumnProps} from 'components/DataGridLayout';
import {SearchInput} from 'components/SearchInput';
import {
  useAllElevators,
  useQueryCustomerElevator,
} from 'hooks/reactQuery/useElevator';
import {ElevatorView} from 'models/elevator';
import {FormatDate} from 'models/misc';
import {createEmptyResource, makePage} from 'utils/paging';
import {useFormatDate} from 'hooks/useFormatDate';
import {NoRowsEmptySection} from 'components/DataGrid/NoRowsEmptySection';
import {FormRadio} from 'components/form/FormRadio';
import {PageListingLayout} from 'components/PageListingLayout';

interface Props {
  setRowItem: (row: ElevatorView) => void;
  searchCustomer?: string;
  propertyOwnerId?: string;
}

export const columns = (activeId: string): GridColDef[] => [
  getColumnProps({
    field: 'number',
    headerName: 'number',
    headerAlign: 'center',
    flex: 1,
    renderCell: (params: GridRenderCellParams<any, ElevatorView, any>) => (
      <Box sx={{display: 'flex'}}>
        <FormRadio
          value={params.row.id}
          checked={params.row.id === activeId}
          label={
            <Typography
              variant="body2"
              component="span"
              sx={{display: 'flex', alignItems: 'center', pl: 4}}>
              {params.value || '-'}
            </Typography>
          }
        />
      </Box>
    ),
  }),
  getColumnProps({
    field: 'model',
    headerName: 'model',
  }),
  getColumnProps({
    field: 'address',
    headerName: 'address',
    cellClassName: 'truncateText',
    flex: 1.5,
  }),
  getColumnProps({
    field: 'customer',
    headerName: 'customer',
    cellClassName: 'truncateText',
    flex: 1,
  }),
  getColumnProps({
    field: 'lastVisit',
    headerName: 'last visit',
    cellClassName: 'truncateText',
    flex: 1,
  }),
];

export const makeRows = (
  elevators: ElevatorView[],
  formatDate: FormatDate = () => '',
): GridRowsProp =>
  elevators
    ? elevators.map((item) => ({
        id: item.id,
        number: item.externalId,
        model: item.model,
        customer: item.propertyOwner.name,
        address: item.address.fullName,
        lastVisit: formatDate(item.lastVisitDate),
        nextVisit: formatDate(item.nextVisitDate),
        elevator: item,
      }))
    : [];

const pageSize = 10;

export const QuotationUnitsDataGrid = ({
  setRowItem,
  searchCustomer,
  propertyOwnerId,
}: Props) => {
  const formatDate = useFormatDate();
  const [search, setSearch] = useState(searchCustomer || '');
  const [page, setPage] = useState(makePage(0, pageSize));
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [pageCount, setPageCount] = useState(0);
  const [selectedUnit, setSelectedUnit] = useState<ElevatorView | undefined>();

  const {
    data: customerResource = createEmptyResource<ElevatorView>(pageSize),
    isFetching: isCustomerFetching,
    isLoading: isCustomerLoading,
  } = useQueryCustomerElevator(
    {
      query: search,
      pageIndex: page.pageIndex,
      pageSize: page.pageSize,
    },
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
      query: search,
      pageIndex: page.pageIndex,
      pageSize: page.pageSize,
    },
    {keepPreviousData: true, enabled: !propertyOwnerId},
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
        <LinearProgress />
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
        defaultValue={searchCustomer}
      />
      <PageListingLayout containerStyle={{height: '48vh'}}>
        <DataGridLayout
          height="100%"
          fullHeight={false}
          rows={rows || []}
          columns={columns(selectedUnit?.id || '')}
          scrollToTop={search}
          onCellClick={(params) => {
            setRowItem(params.row.elevator);
            setSelectedUnit(params.row.elevator);
          }}
          loading={isCustomerFetching || isElevatorFetching}
          pageSize={page.pageSize}
          pageIndex={page.pageIndex + 1}
          pageCount={pageCount}
          totalRows={customerResource.total || elevatorResource.total}
          handlePageChange={(value) =>
            setPage((prev) => ({
              ...prev,
              pageIndex: value - 1,
            }))
          }
          isEvenRowDifferentColor
          noRowsEmptySection={
            <NoRowsEmptySection
              placeholder="unit"
              action={() => window.open('/units/new', '_blank')}
            />
          }
        />
      </PageListingLayout>
    </>
  );
};
