import {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import {GridRowsProp} from '@mui/x-data-grid';
import {Widget} from 'components/Widget';
import {DataGridLayout} from 'components/DataGridLayout';
import {
  columns,
  makeRows,
} from 'pages/CustomerDetails/Tabs/CustomerUnitDataGrid';
import {useAllElevators} from 'hooks/reactQuery/useElevator';
import {ElevatorView} from 'models/elevator';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {TabContentContainer} from 'components/TabContentContainer';
import {EmptySection} from 'components/EmptySection';
import {useNavigate} from 'react-router';

export const UnitsTab = () => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const [page, setPage] = useState(makePage(0, 25)); // TODO: implement paging
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [pageCount, setPageCount] = useState(0);
  const {
    data: elevator = createEmptyResource<ElevatorView>(10),
    isFetching,
    isLoading,
  } = useAllElevators({
    query: search,
    pageIndex: page.pageIndex,
    pageSize: page.pageSize,
  });

  useEffect(() => {
    if (elevator.data) {
      setRows(makeRows(elevator));
    } else {
      setRows([]);
    }
  }, [elevator]);

  useEffect(() => {
    if (elevator) {
      setPageCount(Math.ceil(elevator.total / page.pageSize));
    }
  }, [elevator, page]);

  const renderWidget = () => (
    <Box>
      <Widget
        searchPlaceholder="Search order type, customer, address"
        getSearchValue={(val: string) => setSearch(val)}
      />
    </Box>
  );

  return (
    <TabContentContainer>
      {renderWidget()}
      <DataGridLayout
        hideFooter={!isFetching && !isLoading && pageCount <= 1}
        noRowsEmptySection={
          <EmptySection
            illustration="clipboard"
            size="tiny"
            containerStyle={{my: 'auto'}}
            btnAction={() => navigate('/units/new')}
            label="No units yet. They will appear here once added!"
            btnLabel="+ Add Unit"
            showActionBtn
          />
        }
        noResultsEmptySection={
          <EmptySection
            illustration="clipboard"
            size="tiny"
            containerStyle={{my: 'auto'}}
            btnAction={() => navigate('/units/new')}
            label="No units yet. They will appear here once added!"
            btnLabel="+ Add Unit"
            showActionBtn
          />
        }
        loading={isFetching || isLoading}
        rows={rows}
        columns={columns}
        pageSize={page.pageSize}
        pageIndex={page.pageIndex}
        handlePageSizeChange={(newPageSize) =>
          setPage({...page, pageSize: newPageSize})
        }
        handlePageChange={(newPage) => setPage({...page, pageIndex: newPage})}
      />
    </TabContentContainer>
  );
};
