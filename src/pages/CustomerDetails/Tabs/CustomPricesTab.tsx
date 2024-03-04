import {useEffect, useRef, useState} from 'react';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {useTranslation} from 'react-i18next';
import {FormikHelpers} from 'formik';
import {GridRowsProp} from '@mui/x-data-grid';
import Typography from '@mui/material/Typography';
import {EmptySection} from 'components/EmptySection';
import {InfoCard} from 'components/InfoCard';
import {Progress} from 'components/Progress';
import {DataGridLayout} from 'components/DataGridLayout';
import {ArticleView, PropertyOwnerArticleRecord} from 'models/article';
import {
  useCreatePropertyOwnerArticle,
  usePropertyOwnerArticles,
} from 'hooks/reactQuery/useArticle';
import {
  columns,
  makeRows,
} from './CustomerPricesDataGrid/CustomerPricesDataGrid';
import {CustomerPricesForm} from './CustomerPricesDataGrid/CustomerPricesForm';

interface Props {
  propertyOwnerId: string;
}

const pageSize = 25;

export const CustomPricesTab = ({propertyOwnerId}: Props) => {
  const {t} = useTranslation();

  const [page, setPage] = useState(makePage(0, 25));
  const totalArticlesRef = useRef(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [rows, setRows] = useState<GridRowsProp>([]);

  const {
    data: articleResource = createEmptyResource<ArticleView>(pageSize),
    isLoading,
    isFetching,
    isFetched,
  } = usePropertyOwnerArticles(
    propertyOwnerId,
    {
      pageIndex: page.pageIndex,
      pageSize: page.pageSize,
    },
    {keepPreviousData: true},
  );

  const {mutateAsync: createArticle} = useCreatePropertyOwnerArticle(
    t('Article created successfully'),
  );

  totalArticlesRef.current = totalArticlesRef.current || articleResource.total;

  useEffect(() => {
    setPageCount(Math.ceil(articleResource.total / page.pageSize));
  }, [articleResource, page.pageSize]);

  useEffect(() => {
    if (isFetched) setRows(makeRows(articleResource.data));
  }, [articleResource]);

  const onClose = () => {
    setOpenDialog(false);
  };

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

  return (
    <>
      <InfoCard
        header={
          <Typography variant="subtitle1">
            {t('Customer specific article')}
          </Typography>
        }
        containerStyles={{flexGrow: 1}}
        bodyContainerStyle={{height: '100%'}}
        headerStyles={{mt: '0.5rem'}}
        handleAction={() => setOpenDialog(true)}
        headerActionIcon={
          <Typography color="info.main">
            {`+ ${t('Add Article & Spare part')}`}
          </Typography>
        }
        showHeaderBackground>
        {isLoading ? (
          <Progress />
        ) : isFetched && !totalArticlesRef.current ? (
          <EmptySection
            label="No specific prices added, start adding your service prices!"
            showActionBtn
            btnLabel="Add Article"
            btnAction={() => setOpenDialog(true)}
            illustration="clipboard"
            size="small"
            containerStyle={{height: '80%'}}
          />
        ) : (
          <DataGridLayout
            fullHeight={false}
            isCellClickable={false}
            height="100%"
            rows={rows || []}
            columns={columns}
            loading={isFetching}
            pageSize={page.pageSize}
            handlePageSizeChange={(newPageSize: number) =>
              setPage({...page, pageSize: newPageSize})
            }
            handlePageChange={(newPage: number) => {
              setPage({...page, pageIndex: newPage - 1});
            }}
            pageCount={pageCount}
            totalRows={articleResource.total}
            pageIndex={page.pageIndex + 1}
          />
        )}
      </InfoCard>
      <CustomerPricesForm
        title="Add customer specific article"
        openDialog={openDialog}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </>
  );
};
