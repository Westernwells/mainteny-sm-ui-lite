import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useTheme from '@mui/material/styles/useTheme';
import {GridCellParams, GridRowsProp} from '@mui/x-data-grid';
import {DataGridLayout} from 'components/DataGridLayout';
import {EmptySection} from 'components/EmptySection';
import {PageCard} from 'components/PageCard';
import {SearchInput} from 'components/SearchInput';
import {useAllElevators} from 'hooks/reactQuery/useElevator';
import {ElevatorView} from 'models/elevator';
import {useEffect, useRef, useState} from 'react';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {Progress} from 'components/Progress';
import {columns, makeRows} from './UnitDataGridProps';

interface Props {
  getSelectedUnit: (val?: ElevatorView) => void;
  initialSelectedUnit?: ElevatorView;
}

const pageInfo = makePage(0, 10);

export const SelectUnit = ({getSelectedUnit, initialSelectedUnit}: Props) => {
  const theme = useTheme();
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
    isFetching,
    isLoading,
    isIdle,
  } = useAllElevators(
    search,
    page,
    {
      status: [],
    },
    {keepPreviousData: true},
  );
  // sets this value only once
  totalUnitsRef.current = totalUnitsRef.current || elevatorResponse.total;

  useEffect(() => {
    if (!isLoading) {
      setRows(makeRows(elevatorResponse.data));
    }
  }, [elevatorResponse, isLoading]);

  useEffect(() => {
    setPageCount(Math.ceil(elevatorResponse.total / page.pageSize));
  }, [elevatorResponse, page.pageSize]);

  useEffect(() => {
    if (getSelectedUnit) {
      getSelectedUnit(selectedUnit);
    }
  }, [selectedUnit]);

  if (isIdle || isLoading) {
    return <Progress />;
  }

  if (!totalUnitsRef.current) {
    return (
      <PageCard
        containerStyles={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
        }}
        headerLabel="Choose unit"
        customHeader={
          <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
            <Typography variant="h6" component="div">
              Choose unit
            </Typography>
            <SearchInput
              placeholder="search"
              containerStyle={{
                background: '#fff',
                border: `1px solid ${theme.palette.text.secondary}`,
              }}
            />
          </Box>
        }
        contentContainerStyles={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <EmptySection
          illustration="clipboard"
          showActionBtn
          btnLabel="Add New"
          btnAction={() => {}}
          size="tiny"
          containerStyle={{
            height: '100%',
            width: '50%',
          }}
          label='Sorry, we couldn"t find any unit that matches the search text. If you like to add a new unit, 
please click the button below'
        />
      </PageCard>
    );
  }

  return (
    <>
      <Box display="flex" justifyContent="space-between">
        <Typography variant="h6" component="div">
          Select unit
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
