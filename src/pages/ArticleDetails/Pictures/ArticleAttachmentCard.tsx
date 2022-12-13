import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import EditIcon from '@mui/icons-material/Create';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import useTheme from '@mui/material/styles/useTheme';
import _ from 'lodash';
import {ArticleView} from '../../../models/article';
import {useDownloadUrl} from '../../../hooks/reactQuery/useDownloadUrl';
import {NoItemSection} from '../NoItemSection';
import {InfoCard} from '../../../components/InfoCard';
import {useUpdateArticle} from '../../../hooks/reactQuery/useArticle';
import {ArticleImageUploadForm} from './ArticleImageUploadForm';
import {FileResourceRecord} from '../../../models/media';
import {makeAmountRecord} from '../../../utils/currency';

export const ArticleAttachmentCard = ({article}: {article: ArticleView}) => {
  const theme = useTheme();
  const [currentUrl, setCurrentUrl] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const {t} = useTranslation();

  const {mutateAsync: updateArticle} = useUpdateArticle(
    t('Article updated successfully'),
  );
  const {data: pictureUrls = {}} = useDownloadUrl(
    _.map(article.additionalInfo.pictureUrls, (item) => item),
  );

  useEffect(() => {
    if (!_.isEmpty(pictureUrls)) {
      setCurrentUrl(_.values(pictureUrls)[0]);
    }
  }, [pictureUrls]);

  const saveArticle = async (files: FileResourceRecord[]) => {
    const temp = {
      category: article.category,
      description: article.description,
      manufacturer: article.manufacturer,
      model: article.model,
      name: article.name,
      externalId: article.externalId,
      pictureUrls: [
        ...(article.additionalInfo.pictureUrls || []),
        ...files.map((it) => it.uri),
      ],
      qrCode: article.additionalInfo.qrCode,
      serviceCompanyId: article.serviceCompanyId!,
      stock: article.stock,
      storageLocation: article.storageLocation,
      subCategory: article.subCategory,
      suppliers: article.additionalInfo.suppliers || [],
      type: article.type.toUpperCase(),
      unit: article.unit,
      unitPurchaseAmount: makeAmountRecord(
        article.unitPurchaseAmount.netAmount,
        article.unitPurchaseAmount.currency,
        article.unitPurchaseAmount.percentageVat,
      ),
      unitSellingAmount: makeAmountRecord(
        article.unitSellingAmount.netAmount,
        article.unitSellingAmount.currency,
        article.unitSellingAmount.percentageVat,
      ),
    };
    await updateArticle({articleId: article!.id, article: temp});
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
            buttonLabel={t('+ Add Attachments')}
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
          hints={[
            t('JPEG, PNG, BMP, GIF, WEBP, SVG only'),
            t('File size less than 5MB only'),
          ]}
        />
      )}
    </InfoCard>
  );
};
