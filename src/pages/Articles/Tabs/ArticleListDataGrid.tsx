import {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  GridCellParams,
  GridColDef,
  GridColumnHeaderParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import {useNavigate} from 'react-router-dom';
import _ from 'lodash';
import {ArticleOrderField, ArticleType, ArticleView} from 'models/article';
import {formatCurrency} from 'utils/currency';
import {createEmptyResource, makePage} from 'utils/paging';
import {useArticles} from 'hooks/reactQuery/useArticle';
import {Progress} from 'components/Progress';
import {DataGridLayout, getColumnProps} from 'components/DataGridLayout';
import {EmptySection} from 'components/EmptySection';
import {FilterFields} from 'components/FilterFields';
import {MultipleSelectCheckmarks} from 'components/MultipleSelectCheckmarks';
import {Widget} from 'components/Widget';
import {PageListingLayout} from 'components/PageListingLayout';
import {convertToText, stringToTitleCase} from 'utils/utils';
import {useQueryState} from 'hooks/useQueryState';
import {useSearchValues} from 'hooks/useSearchValues';
import DOMPurify from 'dompurify';
import {
  hasMultipleParagraphs,
  returnFirstParagraph,
} from '../../../utils/rich-text-field';
import {Order, OrderByParams} from '../../../models/pagination';

export const columns: GridColDef[] = [
  getColumnProps({
    field: ArticleOrderField.NAME,
    headerName: 'NAME',
    cellClassName: 'truncateText',
    sortable: true,
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
    field: ArticleOrderField.EXTERNAL_ID,
    sortable: true,
    headerName: 'Article ID',
  }),
  getColumnProps({
    field: ArticleOrderField.TYPE,
    sortable: true,
    headerName: 'TYPE',
    cellClassName: 'truncateText',
    flex: 0.5,
  }),
  getColumnProps({
    field: ArticleOrderField.UNIT,
    sortable: true,
    headerName: 'UNIT',
    cellClassName: 'truncateText',
    flex: 0.5,
    renderHeader: (params: GridColumnHeaderParams) => {
      const {t} = useTranslation();

      return (
        <>
          <Typography variant="subtitle2" color="textSecondary">
            {params.colDef.headerName && t(params.colDef.headerName)}
          </Typography>
          <Tooltip
            title={t(
              'The item will be measured in terms of this unit (e.g. kg, piece, set)',
            )}
            placement="top"
            arrow
            PopperProps={{
              modifiers: [
                {
                  name: 'offset',
                  options: {
                    offset: [0, -10],
                  },
                },
              ],
            }}>
            <IconButton sx={{color: 'action.active'}}>
              <InfoOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
      );
    },
  }),
  getColumnProps({
    field: ArticleOrderField.SELLING_NET_AMOUNT,
    sortable: true,
    headerName: 'SELLING PRICE (EXCL. VAT)',
    cellClassName: 'truncateText',
    align: 'right',
  }),
  getColumnProps({
    field: ArticleOrderField.DESCRIPTION,
    sortable: true,
    headerName: 'DESCRIPTION',
    cellClassName: 'truncateText',
    renderCell: (params: GridCellParams) => {
      const valueToShow = hasMultipleParagraphs(params.formattedValue)
        ? returnFirstParagraph(params.formattedValue)
        : params.formattedValue;

      return (
        <Typography
          dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(valueToShow)}}
        />
      );
    },
  }),
  getColumnProps({
    field: ArticleOrderField.SELLING_PERCENTAGE_VAT,
    sortable: true,
    headerName: 'TAXES (VAT)',
    cellClassName: 'truncateText',
    align: 'right',
  }),
];

export const ArticleListDataGrid = () => {
  const {t} = useTranslation();
  const pageSize = 25;
  const makeRows = (articles: ArticleView[]): GridRowsProp =>
    _.map(articles, (item, index) => ({
      id: index,
      [ArticleOrderField.NAME]: item.name,
      [ArticleOrderField.EXTERNAL_ID]: item.externalId ? item.externalId : '-',
      [ArticleOrderField.TYPE]: `${t(stringToTitleCase(item.type))}`,
      [ArticleOrderField.UNIT]: item.unit,
      [ArticleOrderField.SELLING_NET_AMOUNT]: formatCurrency(
        (item.unitSellingAmount.netAmount ?? 0) /
          10 ** (item.unitSellingAmount.fractionDigits ?? 2),
        {
          currency: item.unitSellingAmount.currency,
        },
      ),
      [ArticleOrderField.DESCRIPTION]: item.description,
      [ArticleOrderField.SELLING_PERCENTAGE_VAT]: item.unitSellingAmount
        .percentageVat
        ? `${item.unitSellingAmount.percentageVat}%`
        : '-',
      navigateTo: `details/${item.id}`,
      item,
    }));
  const navigate = useNavigate();
  const [page, setPage] = useQueryState('page', {
    defaultValue: makePage(0, pageSize),
  });
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [pageCount, setPageCount] = useState(0);
  const [type, setType] = useQueryState<ArticleType[]>('type', {
    defaultValue: [],
  });
  const [query, setQuery] = useQueryState('query');
  const textInput = useRef<HTMLInputElement>(null);

  const {values, clearValues} =
    useSearchValues<OrderByParams<ArticleOrderField>>();
  const {sortOrder, orderByField} = values;

  const totalArticlesRef = useRef(0);
  const {
    data: articleResource = createEmptyResource<ArticleView>(pageSize),
    isIdle,
    isLoading,
    isFetching,
    isFetched,
  } = useArticles(
    {
      pageIndex: page.pageIndex,
      pageSize: page.pageSize,
      query,
      type,
      order: sortOrder || Order.DESC,
      orderByField: orderByField || ArticleOrderField.CREATED_DATE,
    },
    {keepPreviousData: true},
    true,
  );

  totalArticlesRef.current = totalArticlesRef.current || articleResource.total;

  const navigateToNewArticle = () => {
    navigate('/articles/new');
  };

  useEffect(() => {
    if (articleResource.total > 0 && articleResource.data.length === 0) {
      setPage({...page, pageIndex: 0});
    }
  }, [query, type]);

  useEffect(() => {
    setPageCount(Math.ceil(articleResource.total / page.pageSize));
  }, [page.pageSize, articleResource]);

  useEffect(() => {
    if (!isIdle && !isLoading) {
      setRows(makeRows(articleResource.data));
    }
  }, [articleResource]);

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

  if (isFetched && !totalArticlesRef.current) {
    return (
      <EmptySection
        label="No articles yet. Please click the button below to add."
        showActionBtn
        btnLabel="Add Article"
        containerStyle={{
          height: '100%',
          mb: '10em',
        }}
        btnAction={navigateToNewArticle}
      />
    );
  }

  return (
    <PageListingLayout
      renderWidget={
        <Widget
          searchPlaceholder="Search by name, category, manufacturer etc."
          getSearchValue={setQuery}
          refInput={textInput}
          defaultSearchValue={query}
          filterItems={
            <FilterFields onClear={clearValues}>
              <MultipleSelectCheckmarks
                label="Type"
                options={Object.keys(ArticleType).map((it) =>
                  convertToText(it),
                )}
                getSelectedValue={(items) =>
                  items[0] && setType([items[0].toUpperCase()] as ArticleType[])
                }
                multiple={false}
                initialSelectedItems={
                  type.length ? [convertToText(type[0])] : []
                }
                disableClearBtn
              />
            </FilterFields>
          }
        />
      }>
      <DataGridLayout
        rows={rows}
        columns={columns}
        loading={isFetching}
        scrollToTop={query}
        pageSize={page.pageSize}
        pageIndex={page.pageIndex + 1}
        pageCount={pageCount}
        handlePageChange={(value) =>
          setPage({
            ...page,
            pageIndex: value - 1,
          })
        }
      />
    </PageListingLayout>
  );
};
