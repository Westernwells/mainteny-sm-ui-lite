import {Dispatch, SetStateAction, useEffect, useState} from 'react';
import {GridColDef, GridRowsProp} from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import {DataGridLayout, getColumnProps} from 'components/DataGridLayout';
import {Progress} from 'components/Progress';
import {useArticles} from 'hooks/reactQuery/useArticle';
import {ArticleView} from 'models/article';
import {formatCurrency} from 'utils/currency';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {useTranslation} from 'react-i18next';
import {NoRowsEmptySection} from './NoRowsEmptySection';
import {styles} from './style';

interface Props {
  setRowItem: (row: ArticleView) => void;
  search: string;
  setSearch?: Dispatch<SetStateAction<''>>;
}

export const columns: GridColDef[] = [
  getColumnProps({
    field: 'number',
    headerName: `article no`,
    flex: 1,
  }),
  getColumnProps({
    field: 'name',
    headerName: 'article name',
    flex: 2,
    cellClassName: 'truncateText',
  }),
  getColumnProps({
    field: 'type',
    headerName: 'type',
  }),
  getColumnProps({
    field: 'model',
    headerName: 'model',
    cellClassName: 'truncateText',
  }),
  getColumnProps({
    field: 'manufacturer',
    headerName: 'manufacturer',
    cellClassName: 'truncateText',
    flex: 1.3,
  }),
  getColumnProps({
    field: 'description',
    headerName: 'description',
    cellClassName: 'truncateText',
    headerAlign: 'left',
    flex: 2,
  }),
  getColumnProps({
    field: 'price',
    headerName: 'unit price',
    headerAlign: 'right',
    align: 'right',
    flex: 1.5,
  }),
];

const pageSize = 25;

export const ArticlesDataGrid = ({setRowItem, search, setSearch}: Props) => {
  const {t} = useTranslation();

  const makeRows = (articles: ArticleView[]): GridRowsProp =>
    articles
      ? articles.map((item, index) => ({
          id: index,
          name: item.name,
          number: item.externalId,
          type: `${t(item.type)}`,
          model: item.model,
          manufacturer: item.manufacturer,
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
    true,
  );

  useEffect(() => {
    setSearch?.('');
  }, []);

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
    <Box display="flex" flexGrow={1} sx={styles.scrollBar}>
      <DataGridLayout
        rows={rows}
        columns={columns}
        onCellClick={(params) => setRowItem(params.row.article)}
        loading={isFetching}
        scrollToTop={search}
        pageSize={page.pageSize}
        pageIndex={page.pageIndex + 1}
        pageCount={pageCount}
        handlePageChange={(value) =>
          setPage((prev) => ({
            ...prev,
            pageIndex: value - 1,
          }))
        }
        noRowsEmptySection={
          <NoRowsEmptySection
            placeholder={t('Article')}
            action={() => window.open('/articles/new', '_blank')}
          />
        }
      />
    </Box>
  );
};
