import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import Box from '@mui/material/Box';
import {GridColDef, GridRowsProp} from '@mui/x-data-grid';
import {DataGridLayout, getColumnProps} from 'components/DataGridLayout';
import {SearchInput} from 'components/SearchInput';
import {Progress} from 'components/Progress';
import {useQueryArticleSuppliers} from 'hooks/reactQuery/useArticle';
import {ArticleSupplierView} from 'models/article';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {NoRowsEmptySection} from './NoRowsEmptySection';
import {styles} from './style';

interface Props {
  setRowItem: (row: ArticleSupplierView) => void;
}

export const columns: GridColDef[] = [
  getColumnProps({
    field: 'name',
    headerName: 'supplier',
    flex: 1.5,
  }),
  getColumnProps({
    field: 'number',
    headerName: 'supplier no.',
    flex: 0,
  }),
  getColumnProps({
    field: 'address',
    headerName: 'address',
    cellClassName: 'truncateText',
    flex: 1.5,
  }),
  getColumnProps({
    field: 'phone',
    headerName: 'phone no.',
  }),
];

export const makeRows = (
  articleSuppliers: ArticleSupplierView[],
): GridRowsProp =>
  articleSuppliers
    ? articleSuppliers.map((item, index) => ({
        id: index,
        name: item.name,
        number: item.externalId,
        address: item.address?.fullName,
        phone: item.contact.phone,
        articleSupplier: item,
      }))
    : [];

const pageSize = 10;

export const SuppliersDataGrid = ({setRowItem}: Props) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(makePage(0, pageSize));
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [pageCount, setPageCount] = useState(0);

  const {
    data: articleSupplierResource = createEmptyResource<ArticleSupplierView>(
      pageSize,
    ),
    isLoading,
    isFetching,
    isIdle,
  } = useQueryArticleSuppliers(page, search, {keepPreviousData: true});

  useEffect(() => {
    setPageCount(Math.ceil(articleSupplierResource.total / page.pageSize));
  }, [articleSupplierResource, page.pageSize]);

  useEffect(() => {
    setRows(makeRows(articleSupplierResource.data));
  }, [articleSupplierResource]);

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
        variant="outlined"
        label="Search"
        placeholder="Search by number, name, address etc."
        onValueChanged={(value) => setSearch(value)}
      />
      <Box display="flex" flexGrow={1} sx={styles.scrollBar}>
        <DataGridLayout
          rows={rows}
          columns={columns}
          scrollToTop={search}
          onCellClick={(params) => setRowItem(params.row.articleSupplier)}
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
          noRowsEmptySection={
            <NoRowsEmptySection
              placeholder="Article Supplier"
              action={() => navigate(-1)}
            />
          }
        />
      </Box>
    </>
  );
};
