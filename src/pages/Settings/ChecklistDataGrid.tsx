import {useEffect, useRef, useState} from 'react';
import _ from 'lodash';
import {GridColDef, GridRowsProp} from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import ListAltIcon from '@mui/icons-material/ListAlt';
import {useNavigate} from 'react-router-dom';
import {CheckList} from 'models/checklist';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {useQueryChecklists} from 'hooks/reactQuery/useChecklists';
import {Progress} from 'components/Progress';
import {DataGridLayout, getColumnProps} from 'components/DataGridLayout';
import {EmptySection} from 'components/EmptySection';
import {Widget} from 'components/Widget';
import {PageListingLayout} from 'components/PageListingLayout';
import {formatDate} from 'utils/datetime';
import {Actions} from './Actions';

export const columns: GridColDef[] = [
  getColumnProps({
    field: 'name',
    headerName: 'name',
  }),
  getColumnProps({
    field: 'dateCreated',
    headerName: 'date created',
  }),
  getColumnProps({
    field: 'categories',
    headerName: 'categories',
    align: 'right',
  }),
  getColumnProps({
    field: 'totalTasks',
    headerName: 'total tasks',
    align: 'right',
  }),
  getColumnProps({
    field: 'actions',
    headerName: 'actions',
    align: 'center',
    renderCell: (params) => <Actions checklist={params.row.checklist} />,
    flex: 1,
  }),
];

export const makeRows = (checklists: CheckList[]): GridRowsProp =>
  checklists.map((item, index) => ({
    id: index,
    name: item.name,
    dateCreated: formatDate(item.meta.createdAt),
    categories: Object.keys(
      _.groupBy(item.questions, (question) => question.category),
    ).length,
    totalTasks: item.questions.length,
    checklist: item,
    navigateTo: `/settings/checklists/${item.id}`,
    navigateOptions: {state: {checklist: item}},
  }));

const pageSize = 25;

export const ChecklistDataGrid = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(makePage(0, pageSize));
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [pageCount, setPageCount] = useState(0);
  const [query, setQuery] = useState('');
  const textInput = useRef<HTMLInputElement>(null);
  const {
    data: checklistResource = createEmptyResource<CheckList>(pageSize),
    isIdle,
    isLoading,
    isFetching,
  } = useQueryChecklists(page, query, {keepPreviousData: true});

  useEffect(() => {
    if (page.pageIndex) {
      setPage({...page, pageIndex: 0});
    }
  }, [query]);

  useEffect(() => {
    setPageCount(Math.ceil(checklistResource.total / page.pageSize));
  }, [page.pageSize]);

  useEffect(() => {
    if (!isIdle && !isLoading) {
      setRows(makeRows(checklistResource.data));
    }
  }, [checklistResource]);

  if (isIdle || isLoading) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexGrow={1}>
        <Progress />
      </Box>
    );
  }

  return (
    <PageListingLayout
      renderWidget={
        <Widget
          searchPlaceholder="Search"
          getSearchValue={setQuery}
          refInput={textInput}
        />
      }>
      <DataGridLayout
        rows={rows}
        columns={columns}
        noRowsEmptySection={
          <EmptySection
            illustration="clipboard"
            label="No checklists yet"
            subLabel="Create and customize your own list"
            showActionBtn
            btnLabel="New Checklist"
            actionButtonIcon={<ListAltIcon />}
            containerStyle={{
              height: '100%',
              mb: '10em',
            }}
            btnAction={() => navigate('/settings/checklist/new')}
          />
        }
        loading={isFetching}
        scrollToTop={query}
        pageSize={page.pageSize}
        pageIndex={page.pageIndex + 1}
        pageCount={pageCount}
        hideFooter={pageCount <= 1}
        handlePageChange={(value) =>
          setPage((prev) => ({
            ...prev,
            pageIndex: value - 1,
          }))
        }
        containerStyle={{
          py: 1.5,
        }}
      />
    </PageListingLayout>
  );
};
