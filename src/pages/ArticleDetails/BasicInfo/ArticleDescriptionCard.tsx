import {useContext, useMemo, useState} from 'react';
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
import RichTextEditor from 'components/RichTextEditor';
import {dialogPaperStyles} from 'components/MixedPositions/MixedPositions.styles';
import {PdfStylesContext} from 'context/PdfStylesProvider';
import {Box} from '@mui/material';
import {isHTML} from 'utils/text-block';
import {NoItemSection} from '../NoItemSection';

const validationSchema = Yup.object().shape({
  description: Yup.string()
    .notRequired()
    .test('checkDescriptionSize', CUSTOM_ERROR_TEXT.description, (value) => {
      if (!value) return true;
      return value.length <= 20000;
    }),
});

export const ArticleDescriptionCard = ({article}: {article: ArticleView}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const {t} = useTranslation();
  const {mutateAsync: updateArticle, isLoading} = useUpdateArticle(
    t('Article updated successfully.'),
  );

  const {fontStyles} = useContext(PdfStylesContext);

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

  const displayHtml = useMemo(() => {
    const desc = article.description || '';
    if (!desc) return '';

    if (isHTML(desc)) {
      // sanitize and render real HTML
      return DOMPurify.sanitize(desc);
    }

    // convert plain-text newlines into <br/>
    return desc
      .split(/\r?\n/)
      .map((line) => DOMPurify.sanitize(line))
      .join('<br/>');
  }, [article.description]);

  return (
    <InfoCard
      containerStyles={{mb: '1.2rem'}}
      headerActionIcon={<EditIcon />}
      handleAction={() => setOpenDialog(true)}
      showHeaderBackground
      header={<Typography variant="subtitle1">{t('Description')}</Typography>}>
      {!!article.description && (
        <Box
          dangerouslySetInnerHTML={{__html: displayHtml}}
          sx={{
            '& *': {
              fontFamily: fontStyles?.name
                ? `${fontStyles.name} !important`
                : 'Aventa',
              textAlign: 'left',
            },
            '& p': {
              marginTop: '0.3em',
              marginBottom: '0.3em',
              lineHeight: '1.3em',
            },
            '& ul,ol': {
              margin: 0,
            },
            '& p:empty, p:has(> strong:only-child)': {
              marginTop: '1.3em',
            },
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
          maxWidth: 'lg',
          open: openDialog || false,
        }}
        sx={{
          '& .MuiDialog-paper': {
            ...dialogPaperStyles,
          },
        }}>
        <RichTextEditor
          name="description"
          label={t('Description')}
          placeholder={t(
            'e.g. Flat cable used for door engines from the following suppliers.....',
          )}
          html={formik.values.description || ''}
          updateHtml={(h) => formik.setFieldValue('description', h)}
          hasSignatureButton={false}
          hasAttachFileButton={false}
          required
        />
      </Dialog>
    </InfoCard>
  );
};
