import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {FormikHelpers} from 'formik';
import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import {
  useDeletePropertyOwnerArticle,
  useUpdatePropertyOwnerArticle,
} from 'hooks/reactQuery/useArticle';
import {Confirm} from 'components/Confirm';
import {ArticleView, PropertyOwnerArticleRecord} from 'models/article';
import {Mixpanel} from 'mixpanel/mixpanel';
import {mixpanelEvents} from 'mixpanel/constants';
import {CustomerPricesForm} from './CustomerPricesForm';

interface Props {
  article: ArticleView;
}

export const Actions = ({article}: Props) => {
  const {t} = useTranslation();
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const {mutateAsync: deleteElevator, isLoading: isDeleting} =
    useDeletePropertyOwnerArticle('Article deleted successfully');
  const {mutateAsync: updateArticle} = useUpdatePropertyOwnerArticle(
    t('Article updated successfully.'),
  );

  const onClose = () => {
    Mixpanel.identifyAndTrack(mixpanelEvents.CUSTOMERS_EDIT_CLICK, {
      pageName: 'Customers',
      creationTime: new Date(),
      save: 0,
      cancel: 1,
      source: 'Custom Prices',
    });
    setOpenUpdateDialog(false);
  };

  const onSubmit = async (
    values: PropertyOwnerArticleRecord,
    {resetForm}: FormikHelpers<PropertyOwnerArticleRecord>,
  ) => {
    updateArticle(
      {
        propertyOwnerId: article?.propertyOwnerId ?? '',
        articleId: article.id,
        article: values,
      },
      {
        onSuccess: () => {
          resetForm();
          onClose();
        },
      },
    );
    Mixpanel.identifyAndTrack(mixpanelEvents.CUSTOMERS_EDIT_CLICK, {
      pageName: 'Customers',
      creationTime: new Date(),
      save: 1,
      cancel: 0,
      source: 'Custom Prices',
    });
  };

  return (
    <>
      <Edit
        fontSize="small"
        sx={{color: 'action.active'}}
        onClick={() => setOpenUpdateDialog(true)}
      />
      <Delete
        fontSize="small"
        sx={{color: 'action.active', ml: '1rem'}}
        onClick={() => setOpenDeleteConfirm(true)}
      />

      <Confirm
        disableActions={isDeleting}
        open={openDeleteConfirm}
        onConfirm={async () => {
          await deleteElevator(
            {
              propertyOwnerId: article?.propertyOwnerId ?? '',
              articleId: article.id,
            },
            {onSuccess: () => setOpenDeleteConfirm(false)},
          );
        }}
        onClose={() => setOpenDeleteConfirm(false)}
        title="Confirm"
        content="Do you want to delete this article?"
      />

      <CustomerPricesForm
        title="Edit customer specific article"
        openDialog={openUpdateDialog}
        onClose={onClose}
        onSubmit={onSubmit}
        article={article}
      />
    </>
  );
};
