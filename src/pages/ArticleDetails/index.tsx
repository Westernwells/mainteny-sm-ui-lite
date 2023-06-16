import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import DeleteIcon from '@mui/icons-material/Delete';
import {useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {
  useArticleDetails,
  useDeleteArticle,
} from '../../hooks/reactQuery/useArticle';
import {Progress} from '../../components/Progress';
import {Button} from '../../components/Button';
import {Confirm} from '../../components/Confirm';
import {ArticleBasicInfoCard} from './BasicInfo/ArticleBasicInfoCard';
import {ArticleDescriptionCard} from './BasicInfo/ArticleDescriptionCard';
import {ArticleStockCard} from './Stock/ArticleStockCard';
import {ArticleSupplierCard} from './Suppliers/ArticleSupplierCard';
import {ArticleAttachmentCard} from './Pictures/ArticleAttachmentCard';
import {ArticleQRCard} from './Pictures/ArticleQRCard';

export const ArticleOverView = () => {
  const {id: articleId} = useParams();
  const {data: articleDetail, isLoading} = useArticleDetails(articleId);
  const [deleteArticleConfirm, setDeleteArticleConfirm] = useState(false);
  const navigate = useNavigate();
  const {t} = useTranslation();

  const {mutateAsync: deleteArticle} = useDeleteArticle(
    t('Article deleted successfully'),
  );

  const deleteArticleDialog = () => {
    setDeleteArticleConfirm(true);
  };

  const onDelete = async () => {
    await deleteArticle({articleId: articleDetail!.id});
    setDeleteArticleConfirm(false);
    navigate('/articles');
  };

  if (isLoading) {
    return <Progress />;
  }

  return (
    <>
      <Box display="flex" justifyContent="flex-end" gap={3} mb="1.5rem">
        <Button
          label={t('Order Article')}
          buttonProps={{
            onClick: () =>
              navigate(`/articles/order`, {
                state: {
                  article: articleDetail,
                },
              }),
            variant: 'contained',
            size: 'large',
            sx: {
              textTransform: 'none',
            },
          }}
        />

        {articleDetail && articleDetail.canDelete && (
          <Button
            label={t('Delete')}
            buttonProps={{
              onClick: () => deleteArticleDialog(),
              variant: 'outlined',
              size: 'large',
              sx: {
                bgcolor: 'transparent',
              },
              startIcon: <DeleteIcon />,
            }}
          />
        )}
      </Box>
      <Grid
        container
        spacing={2}
        sx={{
          pb: '1em',
        }}>
        <Grid xs={8} item>
          <ArticleBasicInfoCard article={articleDetail!} />
          <ArticleDescriptionCard article={articleDetail!} />
          <ArticleStockCard article={articleDetail!} />
          <ArticleSupplierCard article={articleDetail!} />
        </Grid>
        <Grid xs={4} item>
          <Box display="flex" flexDirection="column" height="100%">
            <ArticleAttachmentCard article={articleDetail!} />
            <ArticleQRCard article={articleDetail!} />
          </Box>
        </Grid>
      </Grid>
      <Confirm
        open={deleteArticleConfirm}
        onConfirm={() => onDelete()}
        onClose={() => setDeleteArticleConfirm(false)}
        title={t('Delete')}
        content={t('Do you want to delete this article?')}
      />
    </>
  );
};

export default ArticleOverView;
