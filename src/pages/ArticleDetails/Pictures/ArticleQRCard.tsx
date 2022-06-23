import {useState} from 'react';
import EditIcon from '@mui/icons-material/Create';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import _ from 'lodash';
import {ArticleView} from '../../../models/article';
import {useUpdateArticle} from '../../../hooks/reactQuery/useArticle';
import {useDownloadUrl} from '../../../hooks/reactQuery/useDownloadUrl';
import {InfoCard} from '../../../components/InfoCard';
import {ArticleImageUploadForm} from './ArticleImageUploadForm';
import {NoItemSection} from '../NoItemSection';
import {FileResourceRecord} from '../../../models/media';

export const ArticleQRCard = ({article}: {article: ArticleView}) => {
  const [openDialog, setOpenDialog] = useState(false);

  const {mutateAsync: updateArticle} = useUpdateArticle(
    'Article is updated successfully',
  );
  const {data: qrUrls = {}} = useDownloadUrl(
    article.additionalInfo.qrCode ? [article.additionalInfo.qrCode.uri] : [],
  );

  const saveArticle = async (files: FileResourceRecord[]) => {
    const temp = {
      category: article.category,
      description: article.description,
      manufacturer: article.manufacturer,
      model: article.model,
      name: article.name,
      externalId: article.externalId,
      pictureUrls: article.additionalInfo.pictureUrls,
      qrCode: files.length ? files[0] : undefined,
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
      bodyContainerStyle={{height: '100%'}}
      showHeaderBackground
      header={<Typography variant="subtitle1">QR Code</Typography>}>
      <Box
        display="flex"
        flexWrap="wrap"
        justifyContent="center"
        alignItems="center"
        sx={{height: '100%'}}>
        {!_.isEmpty(qrUrls) &&
          _.map(qrUrls, (url, key) => (
            <img
              key={key}
              alt="QR Code"
              src={url}
              style={{
                objectFit: 'cover',
                objectPosition: 'center',
              }}
            />
          ))}
        {_.isEmpty(qrUrls) && (
          <NoItemSection
            placeholder="QR code"
            action={() => setOpenDialog(true)}
          />
        )}
      </Box>
      {openDialog && (
        <ArticleImageUploadForm
          title="Edit QR Code"
          uploadPath={`${article!.serviceCompanyId}/articles/${article!.id}/qr`}
          onClose={saveArticle}
          onCancel={() => setOpenDialog(false)}
          hints={['File size less than 5MB only', 'Max 1 file']}
          maxFiles={1}
        />
      )}
    </InfoCard>
  );
};
