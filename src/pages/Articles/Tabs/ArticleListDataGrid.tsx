import {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
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
import {Mixpanel} from 'mixpanel/mixpanel';
import {mixpanelEvents} from 'mixpanel/constants';
import {ArticleType, ArticleView} from 'models/article';
import {formatCurrency} from 'utils/currency';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {useArticles} from 'hooks/reactQuery/useArticle';
import {Progress} from 'components/Progress';
import {DataGridLayout, getColumnProps} from 'components/DataGridLayout';
import {EmptySection} from 'components/EmptySection';
import {FilterFields} from 'components/FilterFields';
import {MultipleSelectCheckmarks} from 'components/MultipleSelectCheckmarks';
import {Widget} from 'components/Widget';
import {PageListingLayout} from 'components/PageListingLayout';
import {convertToText} from 'utils/utils';

export const columns: GridColDef[] = [
  getColumnProps({
    field: 'name',
    headerName: 'NAME',
    cellClassName: 'truncateText',
  }),
  getColumnProps({
    field: 'externalId',
    headerName: 'Article ID',
  }),
  getColumnProps({
    field: 'type',
    headerName: 'TYPE',
    cellClassName: 'truncateText',
    flex: 0.5,
  }),
  getColumnProps({
    field: 'unit',
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
    field: 'sellingPrice',
    headerName: 'SELLING PRICE (EXCL. VAT)',
    cellClassName: 'truncateText',
    align: 'right',
  }),
  getColumnProps({
    field: 'description',
    headerName: 'DESCRIPTION',
    cellClassName: 'truncateText',
  }),
  getColumnProps({
    field: 'taxes',
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
      name: item.name,
      externalId: item.externalId ? item.externalId : '-',
      type: `${t(
        item.type.toLowerCase().replace(/\b\w/g, (s) => s.toUpperCase()),
      )}`,
      unit: item.unit,
      sellingPrice: formatCurrency(
        (item.unitSellingAmount.netAmount ?? 0) /
          (10 ** item.unitSellingAmount.fractionDigits ?? 0),
        {
          currency: item.unitSellingAmount.currency,
        },
      ),
      description: item.description,
      taxes: item.unitSellingAmount.percentageVat
        ? `${item.unitSellingAmount.percentageVat}%`
        : '-',
      navigateTo: `details/${item.id}`,
      item,
    }));
  const navigate = useNavigate();
  const [page, setPage] = useState(makePage(0, pageSize));
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [pageCount, setPageCount] = useState(0);
  const [type, setType] = useState<ArticleType[]>([]);
  const [query, setQuery] = useState('');
  const textInput = useRef<HTMLInputElement>(null);

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
    },
    {keepPreviousData: true},
    true,
  );

  totalArticlesRef.current = totalArticlesRef.current || articleResource.total;

  const clearAllFilters = () => {
    setQuery('');
    setType([]);
    if (textInput.current) {
      textInput.current.value = '';
    }
  };

  const navigateToNewArticle = () => {
    Mixpanel.identifyAndTrack(mixpanelEvents.NEW_ARTICLE_BUTTON_CLICKED);
    navigate('/articles/new');
  };

  useEffect(() => {
    if (page.pageIndex) {
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
          filterItems={
            <FilterFields onClear={() => clearAllFilters()}>
              <MultipleSelectCheckmarks
                label="Type"
                options={Object.keys(ArticleType).map((it) =>
                  convertToText(it),
                )}
                getSelectedValue={(items) =>
                  items[0] && setType([items[0].toUpperCase()] as ArticleType[])
                }
                multiple={false}
                initialSelectedItems={type}
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
          setPage((prev) => ({
            ...prev,
            pageIndex: value - 1,
          }))
        }
      />
    </PageListingLayout>
  );
};
