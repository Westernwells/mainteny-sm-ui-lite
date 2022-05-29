import Box from '@mui/material/Box';
import {FilterFields} from 'components/FilterFields';
import {MultipleSelectCheckmarks} from 'components/MultipleSelectCheckmarks';
import {useEffect, useState} from 'react';
import {makePage} from 'utils/paging-utils';

import {useSearchParams} from 'react-router-dom';
import {DataGridLayout} from 'components/DataGridLayout';
import {GridRowsProp} from '@mui/x-data-grid';
import {
  formatSearchParamsPageIndex,
  formatSearchParamsPageSize,
} from 'utils/utils';

import {columns, makeRows} from './packageDataGridProps';

interface Props {
  showFilter?: boolean;
  setShowFilter?: (val: boolean) => void;
  searchQuery: string;
}

const packageListResource = {
  pageIndex: 0,
  pageSize: 25,
  total: 3,
  data: [
    {
      name: 'Door Engine Replacement',
      packageNumber: '12234455',
      sellingPrice: 7000,
    },
    {
      name: 'Door Engine Replacement',
      packageNumber: '12234455',
      sellingPrice: 7000,
    },
    {
      name: 'Door Engine Replacement',
      packageNumber: '12234455',
      sellingPrice: 7000,
    },
  ],
};

export const PackageList = ({
  showFilter = false,
  setShowFilter = () => {},
  searchQuery,
}: Props) => {
  const [page, setPage] = useState(makePage(0, 25));
  const [queryParams, setQueryParams] = useSearchParams();
  const [pageCount, setPageCount] = useState(0);
  const [rows, setRows] = useState<GridRowsProp>([]);
  console.log(searchQuery);

  useEffect(() => {
    const currentParams = Object.fromEntries([...queryParams]);
    setPage({
      ...page,
      pageSize: Number(currentParams.pageSize),
      pageIndex: Number(currentParams.pageIndex) - 1,
    });
  }, [queryParams]);

  useEffect(() => {
    setRows(makeRows(packageListResource.data));
  }, [packageListResource]);

  useEffect(() => {
    setPageCount(Math.ceil(packageListResource.total / page.pageSize));
  }, [packageListResource, page.pageSize]);

  const renderFilterItems = () => (
    <FilterFields showFilter={showFilter} setShowFilter={setShowFilter}>
      <MultipleSelectCheckmarks
        label="Status"
        options={[]}
        getSelectedValue={() => {}}
        multiple
      />
    </FilterFields>
  );

  return (
    <Box sx={{flexGrow: 1, display: 'flex', flexDirection: 'column'}}>
      <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
        {renderFilterItems()}
      </Box>

      <DataGridLayout
        hideFooter={pageCount <= 1}
        rows={rows}
        columns={columns}
        loading={false}
        pageSize={page.pageSize}
        pageIndex={page.pageIndex + 1}
        handlePageSizeChange={(newPageSize: number) =>
          setQueryParams(formatSearchParamsPageSize(newPageSize, queryParams))
        }
        handlePageChange={(newPage: number) =>
          setQueryParams(formatSearchParamsPageIndex(newPage, queryParams))
        }
        pageCount={pageCount}
        totalRows={packageListResource.total}
      />
    </Box>
  );
};
