import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  GridAlignment,
  GridColDef,
  GridColumnHeaderParams,
  GridRenderCellParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {useNavigate} from 'react-router';
import _ from 'lodash';
import {ArticleType, ArticleView} from '../../../models/article';
import {netAmount} from '../../../utils/currency';
import {createEmptyResource, makePage} from '../../../utils/paging-utils';
import {useArticles} from '../../../hooks/reactQuery/useArticle';
import {Progress} from '../../../components/Progress';
import {DataGridLayout} from '../../../components/DataGridLayout';
import {EmptySection} from '../../../components/EmptySection';
import {StatusChip} from '../../../components/StatusChip';
import {FilterFields} from '../../../components/FilterFields';
import {MultipleSelectCheckmarks} from '../../../components/MultipleSelectCheckmarks';
import {Widget} from '../../../components/Widget';
import {PageListingLayout} from '../../../components/PageListingLayout';
import {convertToText} from '../../../utils/utils';

const defaultProps = {
  editable: false,
  renderHeader: (params: GridColumnHeaderParams) => {
    const {t} = useTranslation();

    return (
      <Typography variant="subtitle2" color="textSecondary">
        {params.colDef.headerName && t(params.colDef.headerName)}
      </Typography>
    );
  },
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
  headerAlign: 'left',
  align: 'left',
};

export const columns: GridColDef[] = [
  {
    field: 'externalId',
    headerName: 'EXTERNAL ID',
    type: 'string',
    cellClassName: 'nowrap',
    flex: 1,
    headerAlign: 'left',
    align: 'left',
    ...defaultProps,
  },
  {
    field: 'name',
    headerName: 'NAME',
    type: 'string',
    cellClassName: 'truncateText',
    flex: 4,
    headerAlign: 'left',
    align: 'left',
    ...defaultProps,
  },
  {
    field: 'category',
    headerName: 'CATEGORY',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'manufacturer',
    headerName: 'MANUFACTURER',
    type: 'string',
    cellClassName: 'truncateText',
    flex: 2,
    headerAlign: 'left',
    align: 'left',
    ...defaultProps,
  },
  {
    field: 'model',
    headerName: 'MODEL',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'purchasePrice',
    headerName: 'PURCHASE PRICE',
    type: 'string',
    flex: 2,
    headerAlign: 'right',
    align: 'right',
    ...defaultProps,
  },
  {
    field: 'sellingPrice',
    headerName: 'SELLING PRICE',
    type: 'string',
    flex: 2,
    headerAlign: 'right',
    align: 'right',
    ...defaultProps,
  },
  {
    field: 'stock',
    headerName: 'STOCK',
    type: 'string',
    flex: 1,
    headerAlign: 'center',
    align: 'center',
    editable: false,
    renderHeader: (params: GridColumnHeaderParams) => {
      const {t} = useTranslation();

      return (
        <Typography variant="subtitle2" color="textSecondary">
          {params.colDef.headerName && t(params.colDef.headerName)}
        </Typography>
      );
    },
    renderCell: (params: GridRenderCellParams<any, any, any>) => (
      <StatusChip
        label={params.value}
        color="success"
        variant="filled"
        maxChars={3}
      />
    ),
  },
];

export const makeRows = (articles: ArticleView[]): GridRowsProp =>
  _.map(articles, (item, index) => ({
    id: index,
    externalId: item.externalId,
    name: item.name,
    category: item.category,
    manufacturer: item.manufacturer,
    model: item.model,
    purchasePrice: netAmount(item.unitPurchaseAmount),
    sellingPrice: netAmount(item.unitSellingAmount),
    stock: item.stock.currentStock,
    navigateTo: `details/${item.id}`,
    item,
  }));

const pageSize = 25;

const NoArticleSection = ({
  placeholder,
  action,
}: {
  placeholder: string;
  action?: () => void;
}) => (
  <EmptySection
    illustration="clipboard"
    size="tiny"
    containerStyle={{m: 'auto', width: '60%'}}
    label={`No ${placeholder} yet. Please click the button below to add a new ${placeholder}`}
    showActionBtn
    btnLabel="+ Add New Article"
    btnAction={action}
  />
);

export const ArticleListDataGrid = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(makePage(0, pageSize));
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [pageCount, setPageCount] = useState(0);
  const [type, setType] = useState('');
  const [query, setQuery] = useState('');

  const {
    data: articleResource = createEmptyResource<ArticleView>(pageSize),
    isIdle,
    isLoading,
    isFetching,
  } = useArticles(
    {
      pageIndex: page.pageIndex,
      pageSize: page.pageSize,
      query,
      type,
    },
    {keepPreviousData: true},
  );

  const addNewArticle = () => {
    navigate('new');
  };

  useEffect(() => {
    setPageCount(Math.ceil(articleResource.total / page.pageSize));
  }, [page.pageSize]);

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
        <Progress height="100%" />
      </Box>
    );
  }

  return (
    <PageListingLayout
      renderWidget={
        <Widget
          searchPlaceholder="Search by name, category, manufacturer etc."
          getSearchValue={setQuery}
          filterItems={
            <FilterFields>
              <MultipleSelectCheckmarks
                label="Type"
                options={Object.keys(ArticleType).map((it) =>
                  convertToText(it),
                )}
                getSelectedValue={(item: string[]) =>
                  setType(item[0]?.toUpperCase())
                }
                multiple={false}
              />
            </FilterFields>
          }
        />
      }>
      <DataGridLayout
        rows={rows}
        columns={columns}
        loading={isFetching}
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
        noRowsEmptySection={
          <NoArticleSection placeholder="article" action={addNewArticle} />
        }
      />
    </PageListingLayout>
  );
};
