import {useEffect, useState} from 'react';
import {FormikHelpers} from 'formik';
import {useTranslation} from 'react-i18next';
import {GridColDef, GridRenderCellParams, GridRowsProp} from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {CustomerPricesForm} from 'pages/CustomerDetails/Tabs/CustomerPricesDataGrid/CustomerPricesForm';
import {DataGridLayout, getColumnProps} from 'components/DataGridLayout';
import {Progress} from 'components/Progress';
import {EmptySection} from 'components/EmptySection';
import {
  useCreatePropertyOwnerArticle,
  usePropertyOwnerArticles,
} from 'hooks/reactQuery/useArticle';
import {ArticleView, PropertyOwnerArticleRecord} from 'models/article';
import {formatNetAmount} from 'utils/currency';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {convertToText} from 'utils/utils';
import {styles} from './style';

interface Props {
  setRowItem: (row: ArticleView) => void;
  search: string;
  propertyOwnerId: string;
}

export const columns: GridColDef[] = [
  getColumnProps({
    field: 'number',
    headerName: 'article no.',
    flex: 0,
  }),
  getColumnProps({
    field: 'name',
    headerName: 'article',
    renderCell: (params: GridRenderCellParams<any, any, any>) => {
      const {t} = useTranslation();
      return <Typography variant="body2">{t(params.value) || '-'}</Typography>;
    },
  }),
  getColumnProps({
    field: 'type',
    headerName: 'type',
  }),
  getColumnProps({
    field: 'category',
    headerName: 'category',
  }),
  getColumnProps({
    field: 'purchasePrice',
    headerName: 'Purchase price (excl. VAT)',
    align: 'right',
  }),
  getColumnProps({
    field: 'sellingPrice',
    headerName: 'Selling price (excl. VAT)',
    align: 'right',
  }),
];

export const makeRows = (articles: ArticleView[]): GridRowsProp =>
  articles
    ? articles.map((article, index) => ({
        id: index,
        number: article.number,
        name: article.name,
        type: convertToText(article.type),
        category: article.category,
        purchasePrice: formatNetAmount(article.unitPurchaseAmount),
        sellingPrice: formatNetAmount(article.unitSellingAmount),
        article,
      }))
    : [];

const pageSize = 25;

export const CustomPricesDataGrid = ({
  setRowItem,
  search,
  propertyOwnerId,
}: Props) => {
  const [page, setPage] = useState(makePage(0, pageSize));
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [pageCount, setPageCount] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);

  const {
    data: articleResource = createEmptyResource<ArticleView>(pageSize),
    isLoading,
    isFetching,
  } = usePropertyOwnerArticles(
    propertyOwnerId,
    {
      pageIndex: page.pageIndex,
      pageSize: page.pageSize,
      query: search,
    },
    {keepPreviousData: true},
  );
  const {mutateAsync: createArticle} = useCreatePropertyOwnerArticle(
    'Article created successfully',
  );

  useEffect(() => {
    setPageCount(Math.ceil(articleResource.total / page.pageSize));
  }, [articleResource, page.pageSize]);

  useEffect(() => {
    setRows(articleResource.data.length ? makeRows(articleResource.data) : []);
  }, [articleResource]);

  const onClose = () => setOpenDialog(false);

  const onSubmit = async (
    values: PropertyOwnerArticleRecord,
    {resetForm}: FormikHelpers<PropertyOwnerArticleRecord>,
  ) => {
    createArticle(
      {propertyOwnerId, body: values},
      {
        onSuccess: () => {
          resetForm();
          onClose();
        },
      },
    );
  };

  if (isLoading) {
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
      <Box display="flex" flexGrow={1} sx={styles.scrollBar}>
        <DataGridLayout
          rows={rows}
          columns={columns}
          onCellClick={(params) => setRowItem(params.row.article)}
          loading={isFetching}
          scrollToTop={search}
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
            <EmptySection
              illustration="clipboard"
              size="tiny"
              label="No specific prices added, start adding your service prices!"
              showActionBtn
              btnLabel="Add Articles & Spare part"
              containerStyle={{
                m: 'auto',
              }}
              btnAction={() => setOpenDialog(true)}
            />
          }
        />
      </Box>
      <CustomerPricesForm
        title="Add customer specific article"
        openDialog={openDialog}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </>
  );
};
