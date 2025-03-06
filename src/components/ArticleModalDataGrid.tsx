import {useMemo, useState} from 'react';
import {GridCellParams, GridColDef, GridRowsProp} from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import {DataGridLayout, getColumnProps} from 'components/DataGridLayout';
import {SearchInput} from 'components/SearchInput';
import {Progress} from 'components/Progress';
import {useArticles} from 'hooks/reactQuery/useArticle';
import {usePropertyOwnerQueryTravelWorks} from 'hooks/reactQuery/useTravelWork';
import {ArticleType, ArticleView} from 'models/article';
import {ServiceOrderType} from 'models/service-order';
import {formatNetAmount} from 'utils/currency';
import {createEmptyResource, makePage} from 'utils/paging';
import DOMPurify from 'dompurify';
import Typography from '@mui/material/Typography';
import {getArticleTypes} from 'utils/article-utils';
import {NoRowsEmptySection} from './DataGrid/NoRowsEmptySection';
import {
  hasMultipleParagraphs,
  returnFirstParagraph,
} from '../utils/rich-text-field';

interface Props {
  setRowItem: (row: ArticleView) => void;
  customerId?: string;
}

export const columns: GridColDef[] = [
  getColumnProps({
    field: 'number',
    headerName: 'ARTICLE NO',
    align: 'left',
    flex: 1,
  }),
  getColumnProps({
    field: 'name',
    headerName: 'ARTICLE NAME',
    align: 'left',
    flex: 1,
    renderCell: (params: GridCellParams) => {
      const valueToShow = hasMultipleParagraphs(params.formattedValue)
        ? returnFirstParagraph(params.formattedValue)
        : params.formattedValue;

      return (
        <Typography
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(valueToShow),
          }}
        />
      );
    },
  }),
  getColumnProps({
    field: 'model',
    headerName: 'MODEL',
    align: 'left',
    flex: 1,
  }),
  getColumnProps({
    field: 'manufacturer',
    headerName: 'MANUFACTURER',
    align: 'left',
    flex: 1,
    cellClassName: 'truncateText',
  }),
  getColumnProps({
    field: 'price',
    headerName: 'UNIT PRICE',
    align: 'right',
    flex: 1,
    cellClassName: 'truncateText',
  }),
];

export const makeRows = (articles: ArticleView[]): GridRowsProp =>
  articles
    ? articles.map((item, index) => ({
        id: index,
        number: item.externalId,
        name: item.name,
        model: item.model,
        manufacturer: item.manufacturer,
        price: formatNetAmount(item.unitSellingAmount),
        article: item,
      }))
    : [];

const pageSize = 25;

export const ArticlesModalDataGrid = ({setRowItem, customerId}: Props) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(makePage(0, pageSize));

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
      type: getArticleTypes({excludeTypes: [ArticleType.MIX]}),
    },
    {keepPreviousData: true},
    true,
  );

  const {data: customPrices = [], isLoading: isCustomPriceLoading} =
    usePropertyOwnerQueryTravelWorks(
      customerId || '',
      {
        serviceOrderType: ServiceOrderType.GENERAL,
      },
      {enabled: !!customerId},
    );

  const pageCount = useMemo(() => {
    if (!articleResource.total || !page.pageSize) {
      return 0;
    }
    return Math.ceil(articleResource.total / page.pageSize);
  }, [articleResource.total, page.pageSize]);

  const rows = useMemo(() => {
    const articlesUpdatedWithCustomPrice = articleResource.data.map(
      (article) => {
        const customPriceArticle = customPrices.find(
          (c) => c.article.id === article.id,
        );
        if (customPriceArticle) {
          return {
            ...article,
            unitSellingAmount: customPriceArticle.article.unitSellingAmount,
          };
        }
        return article;
      },
    );
    return makeRows(articlesUpdatedWithCustomPrice);
  }, [articleResource, customPrices]);

  if (isIdle || isLoading || isCustomPriceLoading) {
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
        placeholder="Search"
        onValueChanged={(value) => setSearch(value)}
      />
      <Box
        display="flex"
        flexGrow={1}
        sx={{
          '& ::-webkit-scrollbar': {
            width: '0.25em',
          },
          '& ::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '& ::-webkit-scrollbar-thumb': {
            background: 'grey',
            borderRadius: '0.25em',
          },
        }}>
        <DataGridLayout
          rows={rows}
          columns={columns}
          scrollToTop={search}
          onCellClick={(params) => setRowItem(params.row.article)}
          loading={isFetching}
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
              placeholder="article"
              action={() =>
                window.open(`/articles/new?articleName=${search}`, '_blank')
              }
            />
          }
        />
      </Box>
    </>
  );
};
