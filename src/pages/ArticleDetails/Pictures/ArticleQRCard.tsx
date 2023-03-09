import {useState} from 'react';
import {useTranslation} from 'react-i18next';
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
import {makeAmountRecord} from '../../../utils/currency';

export const ArticleQRCard = ({article}: {article: ArticleView}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const {t} = useTranslation();

  const {mutateAsync: updateArticle} = useUpdateArticle(
    t('Article updated successfully'),
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
      header={<Typography variant="subtitle1">{t('QR Code')}</Typography>}>
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
              alt={t('QR Code')}
              src={url}
              style={{
                objectFit: 'cover',
                objectPosition: 'center',
                width: '100%',
              }}
            />
          ))}
        {_.isEmpty(qrUrls) && (
          <NoItemSection
            label={t('No QR code yet. Please click the button below to add!')}
            illustration="qrcode"
            buttonLabel={t('+ Add QR Code')}
            action={() => setOpenDialog(true)}
          />
        )}
      </Box>
      {openDialog && (
        <ArticleImageUploadForm
          title={t('Edit QR Code')}
          uploadPath={`${article!.serviceCompanyId}/articles/${article!.id}/qr`}
          onClose={saveArticle}
          successMessage={t('QR code image uploaded successfully')}
          onCancel={() => setOpenDialog(false)}
        />
      )}
    </InfoCard>
  );
};
