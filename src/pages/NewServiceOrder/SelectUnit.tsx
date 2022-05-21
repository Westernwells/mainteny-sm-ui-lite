/*eslint-disable*/
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {GridCellParams, GridRowsProp} from '@mui/x-data-grid';
import {DataGridLayout} from 'components/DataGridLayout';
import {SearchInput} from 'components/SearchInput';
import {useAllElevators} from 'hooks/reactQuery/useElevator';
import {ElevatorView} from 'models/elevator';
import {useEffect, useRef, useState} from 'react';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {columns, makeRows} from './UnitDataGridProps';

interface Props {
  getSelectedUnit: (val?: ElevatorView) => void;
  initialSelectedUnit?: ElevatorView;
}

const pageInfo = makePage(0, 10);

export const SelectUnit = ({getSelectedUnit, initialSelectedUnit}: Props) => {
  const [search, setSearch] = useState('');
  const totalUnitsRef = useRef(0);
  const [page, setPage] = useState(pageInfo);
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [selectedUnit, setSelectedUnit] = useState<ElevatorView | undefined>(
    initialSelectedUnit,
  );
  const [pageCount, setPageCount] = useState(0);
  const {
    data: elevatorResponse = createEmptyResource<ElevatorView>(10),
    // isLoading,
    // isFetched,
    isFetching,
  } = useAllElevators(
    search,
    page,
    {
      status: [],
    },
    {keepPreviousData: true},
  );
  // set this value only once
  totalUnitsRef.current = totalUnitsRef.current || elevatorResponse.total;

  useEffect(() => {
    setRows(makeRows(elevatorResponse.data));
  }, [elevatorResponse]);

  useEffect(() => {
    setPageCount(Math.ceil(elevatorResponse.total / page.pageSize));
  }, [elevatorResponse, page.pageSize]);

  useEffect(() => {
    if (getSelectedUnit) {
      getSelectedUnit(selectedUnit);
    }
  }, [selectedUnit]);

  return (
    <>
      <Box display="flex" justifyContent="space-between">
        <Typography variant="h6" component="div">
          Choose Unit
        </Typography>
        <SearchInput
          placeholder="Search"
          onValueChanged={(val) => setSearch(val)}
        />
      </Box>
      <DataGridLayout
        hideFooter={pageCount <= 1}
        rows={rows}
        columns={columns(selectedUnit?.id || '')}
        onCellClick={(params: GridCellParams) => {
          setSelectedUnit(params.row.elevator);
        }}
        loading={isFetching}
        pageSize={page.pageSize}
        pageIndex={page.pageIndex + 1}
        handlePageChange={(newPage: number) => {
          setPage({...page, pageIndex: newPage - 1});
        }}
        pageCount={pageCount}
        totalRows={elevatorResponse.total}
      />
    </>
  );
};
