import {useState} from 'react';
import EditIcon from '@mui/icons-material/Create';
import Typography from '@mui/material/Typography';
import {useTranslation} from 'react-i18next';
import {useFormik} from 'formik';
import {Dialog} from 'components/Dialog';
import {InfoCard} from 'components/InfoCard';
import {useUpdateArticle} from 'hooks/reactQuery/useArticle';
import {ArticleView} from 'models/article';
import {ArticleDescriptionFormModel} from 'models/articleForm';
import DOMPurify from 'dompurify';
import {CUSTOM_ERROR_TEXT, stripHtmlTags} from 'models/text-block';
import * as Yup from 'yup';
import RichTextField from '../../../components/RichTextField';
import {NoItemSection} from '../NoItemSection';

const validationSchema = Yup.object().shape({
  description: Yup.string()
    .required('Description is required')
    .test(
      'checkDescriptionSize',
      CUSTOM_ERROR_TEXT.description,
      (value) => value.length <= 20000,
    ),
});

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
    validationSchema,
    onSubmit: async (values, {setSubmitting}) => {
      try {
        await updateArticle({
          articleId: article.id,
          article: {description: values.description},
        });
        setOpenDialog(false);
      } finally {
        setSubmitting(false);
      }
    },
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
        <Typography
          variant="inherit"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(article.description),
          }}
        />
      )}
      {!stripHtmlTags(article.description) && (
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
        disableSaveBtn={!formik.isValid || formik.isSubmitting}
        dialogProps={{
          open: openDialog || false,
        }}>
        <RichTextField
          name="description"
          label={t('Description')}
          placeholder={t(
            'e.g. Flat cable used for door engines from the following suppliers.....',
          )}
          minRows={5}
          html={formik.values.description || ''}
          onBlur={formik.handleBlur}
          updateHtml={(h) => formik.setFieldValue('description', h)}
          error={Boolean(
            formik.touched.description && formik.errors.description,
          )}
          helperText={
            formik.touched.description ? formik.errors.description : undefined
          }
        />
      </Dialog>
    </InfoCard>
  );
};
