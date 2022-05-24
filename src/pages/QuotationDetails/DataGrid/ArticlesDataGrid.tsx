import {useEffect, useState} from 'react';
import {
  GridAlignment,
  GridColDef,
  GridColumnHeaderParams,
  GridRenderCellParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {DataGridLayout} from 'components/DataGridLayout';
import {SearchInput} from 'components/SearchInput';
import {Progress} from 'components/Progress';
import {useArticles} from 'hooks/reactQuery/useArticle';
import {ArticleView} from 'models/article';
import {formatCurrency} from 'utils/currency';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {NoRowsEmptySection} from './NoRowsEmptySection';
import {styles} from './style';

interface Props {
  setRowItem: (row: ArticleView) => void;
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
    field: 'number',
    headerName: 'ARTICLE NO',
    type: 'string',
    cellClassName: 'nowrap',
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'type',
    headerName: 'TYPE',
    type: 'string',
    flex: 2,
    headerAlign: 'left',
    ...defaultProps,
  },
  {
    field: 'model',
    headerName: 'MODEL',
    type: 'string',
    flex: 2,
    headerAlign: 'left',
    ...defaultProps,
  },
  {
    field: 'manufacturer',
    headerName: 'MANUFACTURER',
    type: 'string',
    flex: 2,
    headerAlign: 'left',
    cellClassName: 'truncateText',
    ...defaultProps,
  },
  {
    field: 'description',
    headerName: 'DESCRIPTION',
    type: 'string',
    flex: 2,
    headerAlign: 'left',
    cellClassName: 'truncateText',
    ...defaultProps,
  },
  {
    field: 'price',
    headerName: 'UNIT PRICE',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
  },
];

export const makeRows = (articles: ArticleView[]): GridRowsProp =>
  articles
    ? articles.map((item, index) => ({
        id: index,
        number: item.number,
        type: item.type,
        model: item.model,
        manufacturer: item.manufacture,
        description: item.description,
        price: `${formatCurrency(
          item
            ? item.unitSellingAmount.netAmount /
                10 ** item.unitSellingAmount.fractionDigits!
            : 0,
          {
            currency: item.unitSellingAmount.currency,
          },
        )}`,
        article: item,
      }))
    : [];

const pageSize = 25;

export const ArticlesDataGrid = ({setRowItem}: Props) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(makePage(0, pageSize));
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [pageCount, setPageCount] = useState(0);

  const {
    data: articleResource = createEmptyResource<ArticleView>(pageSize),
    isIdle,
    isLoading,
    isFetching,
  } = useArticles(
    {
      pageIndex: page.pageIndex,
      pageSize: page.pageSize,
      query: search,
    },
    {keepPreviousData: true},
  );

  useEffect(() => {
    setPageCount(Math.ceil(articleResource.total / page.pageSize));
  }, [articleResource, page.pageSize]);

  useEffect(() => {
    if (articleResource.data.length) {
      setRows(makeRows(articleResource.data));
    } else {
      setRows([]);
    }
  }, [articleResource]);

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
        onValueChanged={(value) => setSearch(value)}
      />
      <Box display="flex" flexGrow={1} sx={styles.scrollBar}>
        <DataGridLayout
          rows={rows}
          columns={columns}
          onCellClick={(params) => setRowItem(params.row.article)}
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
          noRowsEmptySection={<NoRowsEmptySection placeholder="article" />}
        />
      </Box>
    </>
  );
};
