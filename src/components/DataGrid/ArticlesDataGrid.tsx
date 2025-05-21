import {Dispatch, SetStateAction, useEffect, useMemo, useState} from 'react';
import {GridCellParams, GridColDef, GridRowsProp} from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import {DataGridLayout, getColumnProps} from 'components/DataGridLayout';
import {Progress} from 'components/Progress';
import {useArticles} from 'hooks/reactQuery/useArticle';
import {ArticleType, ArticleView, ExtendedArticleView} from 'models/article';
import {formatCurrency} from 'utils/currency';
import {createEmptyResource, makePage} from 'utils/paging';
import {useTranslation} from 'react-i18next';
import {stringToTitleCase} from 'utils/utils';
import Typography from '@mui/material/Typography';
import DOMPurify from 'dompurify';
import {getArticleTypes} from 'utils/article-utils';
import {usePropertyOwnerQueryTravelWorks} from 'hooks/reactQuery/useTravelWork';
import {ServiceOrderType} from 'models/service-order';
import {keyBy} from 'lodash';
import {NoRowsEmptySection} from './NoRowsEmptySection';
import {styles} from './style';
import {
  hasMultipleParagraphs,
  returnFirstParagraph,
} from '../../utils/rich-text-field';

interface Props {
  setRowItem: (row: ArticleView) => void;
  search: string;
  setSearch?: Dispatch<SetStateAction<''>>;
  propertyOwnerId?: string;
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
    field: 'price',
    headerName: 'unit price',
    headerAlign: 'right',
    align: 'right',
    flex: 1.5,
  }),
];

const pageSize = 25;

export const ArticlesDataGrid = ({
  setRowItem,
  search,
  setSearch,
  propertyOwnerId,
}: Props) => {
  const {t} = useTranslation();

  const makeRows = (articles: ExtendedArticleView[]): GridRowsProp =>
    articles
      ? articles.map((item, index) => ({
          id: index,
          name: item.name,
          number: item.externalId,
          type: `${t(stringToTitleCase(item.type))}`,
          model: item.model,
          manufacturer: item.manufacturer,
          description: item.description,
          price: `${formatCurrency(
            item
              ? (item.unitSellingAmount?.netAmount ?? 0) /
                  10 ** (item.unitSellingAmount?.fractionDigits ?? 2)
              : 0,
            {
              currency: item.unitSellingAmount?.currency,
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
      type: getArticleTypes({excludeTypes: [ArticleType.MIX]}),
    },
    {keepPreviousData: true},
    true,
  );

  const {data: customPrices = []} = usePropertyOwnerQueryTravelWorks(
    propertyOwnerId || '',
    {serviceOrderType: ServiceOrderType.GENERAL},
    {enabled: !!propertyOwnerId},
  );

  const mergedArticles: ExtendedArticleView[] = useMemo(() => {
    const byId = keyBy(customPrices, (item) => item.article.id);
    return (articleResource.data || []).map((article) => {
      const custom = byId[article.id];
      if (custom?.article) {
        const c = custom.article;
        return {
          ...article,
          name: c.name || article.name,
          description: c.description || article.description,
          unitSellingAmount: c.unitSellingAmount,
          isCustom: true,
        };
      }
      return {...article, isCustom: false};
    });
  }, [articleResource.data, customPrices]);

  useEffect(() => {
    setSearch?.('');
  }, []);

  useEffect(() => {
    setPageCount(Math.ceil(articleResource.total / page.pageSize));
  }, [articleResource.total, page.pageSize]);

  useEffect(() => {
    if (mergedArticles.length) {
      setRows(makeRows(mergedArticles));
    } else {
      setRows([]);
    }
  }, [mergedArticles]);

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
