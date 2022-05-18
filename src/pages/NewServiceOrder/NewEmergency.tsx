import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {GridCellParams, GridRowsProp} from '@mui/x-data-grid';
import {DataGridLayout} from 'components/DataGridLayout';
import {FlexContainer} from 'components/FlexContainer';
import {SearchInput} from 'components/SearchInput';
import {Stepper} from 'components/Stepper';
import {useAllElevators} from 'hooks/reactQuery/useElevator';
import {ElevatorView} from 'models/elevator';
import {useEffect, useRef, useState} from 'react';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {columns, makeRows} from './UnitDataGridProps';

const steps = ['Select Unit', 'Select Technicians', 'Add Description'];

const pageInfo = makePage(0, 50);

export const NewEmergency = () => {
  const [search, setSearch] = useState('');
  const totalUnitsRef = useRef(0);
  const [page, setPage] = useState(pageInfo);
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [activeUnitId, setActiveUnitId] = useState('');
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

  return (
    <Stepper
      steps={steps}
      containerStyles={{
        mt: '3em',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
      }}>
      <FlexContainer>
        <Box display="flex" justifyContent="space-between" mt="2em">
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
          columns={columns(activeUnitId)}
          onCellClick={(params: GridCellParams) =>
            setActiveUnitId(params.row.elevator.id)
          }
          loading={isFetching}
          pageSize={page.pageSize}
          pageIndex={page.pageIndex + 1}
          handlePageChange={(newPage: number) => {
            setPage({...page, pageIndex: newPage - 1});
          }}
          pageCount={pageCount}
          totalRows={elevatorResponse.total}
        />
      </FlexContainer>
    </Stepper>
  );
};
