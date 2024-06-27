import {useState} from 'react';
import EditIcon from '@mui/icons-material/Create';
import Typography from '@mui/material/Typography';
import {useTranslation} from 'react-i18next';
import {useFormik} from 'formik';
import {FormInput} from 'components/form/FormInput';
import {Dialog} from 'components/Dialog';
import {InfoCard} from 'components/InfoCard';
import {useUpdateArticle} from 'hooks/reactQuery/useArticle';
import {ArticleView} from 'models/article';
import {ArticleDescriptionFormModel} from 'models/articleForm';
import {NoItemSection} from '../NoItemSection';

export const ArticleDescriptionCard = ({article}: {article: ArticleView}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const {t} = useTranslation();
  const {mutateAsync: updateArticle, isLoading} = useUpdateArticle(
    t('Article updated successfully.'),
  );

  const formik = useFormik<ArticleDescriptionFormModel>({
    initialValues: {
      description: article.description,
    },
    onSubmit: () => {},
  });

  const saveArticle = async () => {
    await updateArticle({
      articleId: article!.id,
      article: {description: formik.values.description},
    });
    setOpenDialog(false);
  };

  return (
    <InfoCard
      containerStyles={{mb: '1.2rem'}}
      headerActionIcon={<EditIcon />}
      handleAction={() => setOpenDialog(true)}
      showHeaderBackground
      header={<Typography variant="subtitle1">{t('Description')}</Typography>}>
      {article.description && (
        <Typography variant="inherit">{article.description}</Typography>
      )}
      {!article.description && (
        <NoItemSection
          label={t('No description yet. Please click the button below to add!')}
          illustration="clipboard"
          buttonLabel={t('Add Description')}
          action={() => setOpenDialog(true)}
        />
      )}
      <Dialog
        title={t('Edit Description')}
        isSaving={isLoading}
        onCancel={() => setOpenDialog(false)}
        onSave={saveArticle}
        dialogProps={{
          open: openDialog || false,
        }}>
        <FormInput
          containerStyles={{width: '100%', py: '1rem'}}
          fieldProps={{
            name: 'description',
            label: t('Description'),
            placeholder: t(
              'e.g. Flat cable used for door engines from the following suppliers.....',
            ),
            multiline: true,
            rows: 10,
            minRows: 5,
            type: 'text',
            value: formik.values.description,
            onBlur: formik.handleBlur,
            onChange: formik.handleChange,
          }}
        />
      </Dialog>
    </InfoCard>
  );
};
