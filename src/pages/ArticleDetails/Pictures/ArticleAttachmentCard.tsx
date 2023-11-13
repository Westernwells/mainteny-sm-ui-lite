import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import EditIcon from '@mui/icons-material/Create';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import useTheme from '@mui/material/styles/useTheme';
import _ from 'lodash';
import {InfoCard} from 'components/InfoCard';
import {ArticleView} from 'models/article';
import {FileResource, FileResourceRecord} from 'models/media';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {useCreateArticlePictures} from 'hooks/reactQuery/useArticle';
import {NoItemSection} from '../NoItemSection';
import {ArticleImageUploadForm} from './ArticleImageUploadForm';

export const ArticleAttachmentCard = ({article}: {article: ArticleView}) => {
  const theme = useTheme();
  const [currentUrl, setCurrentUrl] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const {t} = useTranslation();

  const {mutateAsync: updateArticlePictures} = useCreateArticlePictures(
    t('Article updated successfully.'),
    article.id,
  );

  const {data: pictureUrls = {}} = useDownloadUrl(
    _.map(
      article.additionalInfo.pictures?.map((item: FileResource) => item.uri),
      (item) => item,
    ),
  );

  useEffect(() => {
    if (!_.isEmpty(pictureUrls)) {
      setCurrentUrl(_.values(pictureUrls)[0]);
    }
  }, [pictureUrls]);

  const saveArticle = async (files: FileResourceRecord[]) => {
    await Promise.all(files.map((file) => updateArticlePictures(file)));
    setOpenDialog(false);
  };

  const setCurrentAttachment = (url: string) => {
    setCurrentUrl(url);
  };

  const thumbs = _.map(pictureUrls, (url, key) => (
    <Box
      onClick={() => setCurrentAttachment(url)}
      key={key}
      sx={{
        mx: '0.1rem',
        border: `2px solid ${
          url === currentUrl
            ? theme.palette.text.secondary
            : theme.palette.text.disabled
        }`,
      }}>
      <img alt="" src={url} width={70} height={70} />
    </Box>
  ));

  return (
    <InfoCard
      containerStyles={{
        mb: '1.2rem',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        height: '100%',
      }}
      headerActionIcon={<EditIcon />}
      handleAction={() => setOpenDialog(true)}
      showHeaderBackground
      bodyContainerStyle={{
        display: 'flex',
        justifyContent: 'center',
        height: '100%',
      }}
      header={<Typography variant="subtitle1">{t('Attachments')}</Typography>}>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center">
        {currentUrl && (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            sx={{height: '100%', mx: '0.5rem', my: '0.5rem'}}>
            <img
              src={currentUrl}
              alt=""
              style={{
                objectFit: 'cover',
                objectPosition: 'center',
                height: '260px',
                width: '100%',
              }}
            />
          </Box>
        )}
        {!_.isEmpty(pictureUrls) && (
          <Box
            display="flex"
            flexWrap="wrap"
            alignItems="start"
            justifyContent="flex-start"
            sx={{width: '100%'}}>
            {thumbs}
          </Box>
        )}
        {_.isEmpty(pictureUrls) && (
          <NoItemSection
            label={t(
              'No attachments yet. Please click the button below to add!',
            )}
            illustration="attachment"
            buttonLabel={t('Add Attachments')}
            action={() => setOpenDialog(true)}
          />
        )}
      </Box>
      {openDialog && (
        <ArticleImageUploadForm
          title={t('Edit Attachments')}
          uploadPath={`${article!.serviceCompanyId}/articles/${
            article!.id
          }/images`}
          onClose={saveArticle}
          onCancel={() => setOpenDialog(false)}
          successMessage={t('Image uploaded successfully')}
          hint="JPEG, PNG, BMP, GIF, WEBP oder SVG"
        />
      )}
    </InfoCard>
  );
};
