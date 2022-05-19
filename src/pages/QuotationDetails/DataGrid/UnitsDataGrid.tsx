import {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
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
import {useAllElevators} from 'hooks/reactQuery/useElevator';
import {ElevatorView} from 'models/elevator';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {formatDate} from 'utils/datetime';
import {convertToText} from 'utils/utils';
import {getElevatorStatusChipColor} from 'utils/elevator-utils';
import {NoRowsEmptySection} from './NoRowsEmptySection';
import {styles} from './style';

interface Props {
  setRowItem: (row: ElevatorView) => void;
  searchCustomer?: string;
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
    headerName: 'UNIT NAME',
    type: 'string',
    flex: 2,
    headerAlign: 'left',
    ...defaultProps,
  },
  {
    field: 'lastVisit',
    headerName: 'LAST VISIT',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'nextVisit',
    headerName: 'NEXT VISIT',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'availability',
    headerName: 'AVAILABILITY',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'status',
    headerName: 'STATUS',
    type: 'string',
    ...defaultAlignment,
    editable: false,
    sortable: false,
    disableColumnMenu: true,
    renderHeader: (params: GridColumnHeaderParams) => (
      <Typography variant="tableHeaderText" color="textSecondary">
        {params.colDef.headerName}
      </Typography>
    ),
    renderCell: (params: GridRenderCellParams<any, any, any>) => (
      <Chip
        variant="outlined"
        label={convertToText(params.value)}
        color={getElevatorStatusChipColor(params.value)}
      />
    ),
  },
];

export const makeRows = (elevators: ElevatorView[]): GridRowsProp =>
  elevators
    ? elevators.map((item, index) => ({
        id: index,
        name: item.model,
        lastVisit: formatDate(item.lastVisitDate),
        nextVisit: formatDate(item.nextVisitDate),
        availability: item.availability,
        status: item.status,
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
    search,
    page,
    {
      status: [],
    },
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
        size="medium"
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
