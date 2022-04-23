import {useEffect, useState} from 'react';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {DataGridLayout} from 'components/DataGridLayout';
import {Progress} from 'components/Progress';

import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import {MultipleSelectCheckmarks} from 'components/MultipleSelectCheckmarks';
import {FilterFields} from 'components/FilterFields';

import {PageOverviewLayout} from 'components/PageOverviewLayout';
import {Widget} from 'components/Widget';
import {GridRowsProp} from '@mui/x-data-grid';
import {EmptySection} from 'components/EmptySection';
import {ElevatorView} from 'models/elevator';
import {useQueryCustomerElevator} from 'hooks/reactQuery/useElevator';
import {columns, makeRows} from './CustomerUnitDataGrid';

interface Props {
  customerId?: string;
}

export const UnitsTab = ({customerId}: Props) => {
  const [page, setPage] = useState(makePage(0, 10));
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [status, setStatus] = useState<string[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [rows, setRows] = useState<GridRowsProp>([]);
  const {data: {total: totalUnits} = createEmptyResource<ElevatorView>(10)} =
    useQueryCustomerElevator(
      {
        query: '',
        pageIndex: 0,
        pageSize: 1,
      },
      null,
      customerId,
    );
  const {
    data: elevatorResource = createEmptyResource<ElevatorView>(10),
    isLoading,
    isFetched,
  } = useQueryCustomerElevator(
    {
      query: search,
      pageIndex: page.pageIndex,
      pageSize: page.pageSize,
    },
    {status},
    customerId,
    {keepPreviousData: true},
  );

  useEffect(() => {
    setPageCount(Math.ceil(elevatorResource.total / page.pageSize));
  }, [elevatorResource, page.pageSize]);

  useEffect(() => {
    setRows(makeRows(elevatorResource));
    if (!showFilter) {
      setStatus([]);
    }
  }, [elevatorResource, showFilter]);

  if (isFetched && !totalUnits) {
    return (
      <EmptySection
        label="No units yet. Create a new one to view here"
        showActionBtn
        btnLabel="Add Contract"
        containerStyle={{
          height: '100%',
          mb: '10em',
        }}
      />
    );
  }

  return (
    <PageOverviewLayout
      label=""
      renderWidget={
        <Widget
          searchPlaceholder="Try 'Astralift BV'"
          getSearchValue={(val: string) => setSearch(val)}
          setShowFilter={setShowFilter}
          showFilter={showFilter}
        />
      }>
      <Fade in={showFilter} unmountOnExit>
        <Box>
          <FilterFields setShowFilter={setShowFilter}>
            <MultipleSelectCheckmarks
              label="Status"
              options={['RUNNING', 'STOPPED']}
              getSelectedValue={(item) => setStatus(item)}
            />
          </FilterFields>
        </Box>
      </Fade>
      {isLoading ? (
        <Progress />
      ) : (
        <DataGridLayout
          fullHeight={false}
          height={400}
          hideFooter={pageCount <= 1}
          rows={rows}
          columns={columns}
          pageSize={page.pageSize}
          handlePageSizeChange={(newPageSize: number) =>
            setPage({...page, pageSize: newPageSize})
          }
          handlePageChange={(newPage: number) => {
            setPage({...page, pageIndex: newPage - 1});
          }}
          pageCount={pageCount}
          totalRows={elevatorResource.total}
        />
      )}
    </PageOverviewLayout>
  );
};
