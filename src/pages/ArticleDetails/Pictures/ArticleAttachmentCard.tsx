import {useEffect, useState} from 'react';
import EditIcon from '@mui/icons-material/Create';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import _ from 'lodash';
import {ArticleView} from '../../../models/article';
import {useDownloadUrl} from '../../../hooks/reactQuery/useDownloadUrl';
import {NoItemSection} from '../NoItemSection';
import {InfoCard} from '../../../components/InfoCard';
import {useUpdateArticle} from '../../../hooks/reactQuery/useArticle';
import {ArticleImageUploadForm} from './ArticleImageUploadForm';
import {FileResourceRecord} from '../../../models/media';

export const ArticleAttachmentCard = ({article}: {article: ArticleView}) => {
  const [currentUrl, setCurrentUrl] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

  const {mutateAsync: updateArticle} = useUpdateArticle(
    'Article is updated successfully',
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
    if (!_.isEmpty(files)) {
      setCurrentUrl(files[0].uri);
    } else {
      setCurrentUrl('');
    }
    const temp = {
      category: article.category,
      description: article.description,
      manufacturer: article.manufacturer,
      model: article.model,
      name: article.name,
      externalId: article.externalId,
      pictureUrls: files.map((it) => it.uri),
      qrCode: article.additionalInfo.qrCode,
      serviceCompanyId: article.serviceCompanyId!,
      stock: article.stock,
      storageLocation: article.storageLocation,
      subCategory: article.subCategory,
      suppliers: article.additionalInfo.suppliers || [],
      type: article.type.toUpperCase(),
      unit: article.unit,
      unitPurchaseAmount: {
        currency: article.unitPurchaseAmount.currency,
        netAmount: article.unitPurchaseAmount.netAmount,
        percentageVat: article.unitPurchaseAmount.percentageVat,
      },
      unitSellingAmount: {
        currency: article.unitSellingAmount.currency,
        netAmount: article.unitSellingAmount.netAmount,
        percentageVat: article.unitSellingAmount.percentageVat,
      },
    };
    await updateArticle({articleId: article!.id, article: temp});
    setOpenDialog(false);
  };

  const setCurrentAttachment = (url: string) => {
    setCurrentUrl(url);
  };

  const thumbs = _.map(pictureUrls, (url, key) => (
    <Box onClick={() => setCurrentAttachment(url)} key={key}>
      <img alt="" src={url} width={80} height={80} />
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
      bodyContainerStyle={{height: '100%'}}
      header={<Typography variant="subtitle1">Attachments</Typography>}>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        sx={{height: '100%'}}>
        {currentUrl && (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            sx={{height: '100%'}}>
            <img
              src={currentUrl}
              alt=""
              style={{
                objectFit: 'cover',
                objectPosition: 'center',
              }}
            />
          </Box>
        )}
        {!_.isEmpty(pictureUrls) && (
          <Box
            display="flex"
            flexWrap="wrap"
            alignItems="start"
            justifyContent="start"
            sx={{width: '100%'}}>
            {thumbs}
          </Box>
        )}
        {_.isEmpty(pictureUrls) && (
          <NoItemSection
            placeholder="attachments"
            action={() => setOpenDialog(true)}
          />
        )}
      </Box>
      {openDialog && (
        <ArticleImageUploadForm
          title="Edit Attachments"
          uploadPath={`${article!.serviceCompanyId}/articles/${
            article!.id
          }/images`}
          onClose={saveArticle}
          onCancel={() => setOpenDialog(false)}
          hints={[
            'JPEG, PNG, BMP, GIF, WEBP, SVG only',
            'File size less than 5MB only',
            'Max 5 files',
          ]}
          maxFiles={5}
        />
      )}
    </InfoCard>
  );
};
