import {useEffect, useRef, useState} from 'react';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {DataGridLayout} from 'components/DataGridLayout';
import {Progress} from 'components/Progress';

import Box from '@mui/material/Box';
import {MultipleSelectCheckmarks} from 'components/MultipleSelectCheckmarks';
import {FilterFields} from 'components/FilterFields';

import {GridRowsProp} from '@mui/x-data-grid';
import {TabContentContainer} from 'components/TabContentContainer';
import {EmptySection} from 'components/EmptySection';
import {ElevatorView} from 'models/elevator';
import {Widget} from 'components/Widget';
import {useQueryCustomerElevator} from 'hooks/reactQuery/useElevator';
import {columns, makeRows} from './CustomerUnitDataGrid';

interface Props {
  customerId?: string;
}

export const UnitsTab = ({customerId}: Props) => {
  const [page, setPage] = useState(makePage(0, 25));
  // const [search, setSearch] = useState('');
  const totalUnitsRef = useRef(0);
  const [status, setStatus] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [pageCount, setPageCount] = useState(0);
  const [rows, setRows] = useState<GridRowsProp>([]);
  const {
    data: elevatorResource = createEmptyResource<ElevatorView>(10),
    isLoading,
    isFetched,
  } = useQueryCustomerElevator(
    {
      query: searchQuery,
      pageIndex: page.pageIndex,
      pageSize: page.pageSize,
    },
    {status},
    customerId,
    {keepPreviousData: true},
  );

  totalUnitsRef.current = elevatorResource.total;

  useEffect(() => {
    setPageCount(Math.ceil(elevatorResource.total / page.pageSize));
  }, [elevatorResource, page.pageSize]);

  useEffect(() => {
    setRows(makeRows(elevatorResource));
  }, [elevatorResource]);

  if (isFetched && !totalUnitsRef.current) {
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

  const renderFilterItems = () => (
    <FilterFields hideClear showFilter>
      <MultipleSelectCheckmarks
        label="Status"
        options={['RUNNING', 'STOPPED']}
        getSelectedValue={(item) => setStatus(item)}
      />
    </FilterFields>
  );

  const renderWidget = () => (
    <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
      <Widget
        searchPlaceholder="Search company name, unit model"
        getSearchValue={(search) => setSearchQuery(search)}
        hideViewOption
        filterItems={renderFilterItems()}
      />
    </Box>
  );

  return (
    <TabContentContainer>
      {renderWidget()}
      {isLoading ? (
        <Progress />
      ) : (
        <DataGridLayout
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
    </TabContentContainer>
  );
};
