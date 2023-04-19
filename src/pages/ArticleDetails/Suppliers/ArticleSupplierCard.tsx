import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import EditIcon from '@mui/icons-material/Create';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import _ from 'lodash';
import cloneDeep from 'lodash/cloneDeep';
import {StatusChip} from '../../../components/StatusChip';
import {NoItemSection} from '../NoItemSection';
import {InfoCard} from '../../../components/InfoCard';
import {ArticleView, SupplierRecord} from '../../../models/article';
import {ArticleSuppliersForm} from './ArticleSuppliersForm';
import {useUpdateArticle} from '../../../hooks/reactQuery/useArticle';
import {makeAmountRecord} from '../../../utils/currency';

export const ArticleSupplierCard = ({article}: {article: ArticleView}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const {mutateAsync: updateArticle, isLoading} = useUpdateArticle(
    'Article updated successfully',
  );
  const {t} = useTranslation();

  const saveArticle = async (suppliers: SupplierRecord[]) => {
    const temp = {
      category: article.category,
      description: article.description,
      manufacturer: article.manufacturer,
      model: article.model,
      name: article.name,
      externalId: article.externalId,
      pictureUrls: article.additionalInfo.pictureUrls,
      qrCode: article.additionalInfo.qrCode,
      serviceCompanyId: article.serviceCompanyId!,
      stock: article.stock,
      storageLocation: article.storageLocation,
      subCategory: article.subCategory,
      suppliers,
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
      containerStyles={{mb: '1.2rem'}}
      headerActionIcon={<EditIcon />}
      handleAction={() => setOpenDialog(true)}
      showHeaderBackground
      header={<Typography variant="subtitle1">{t('Suppliers')}</Typography>}>
      <Box display="flex" justifyContent="space-between">
        {!_.isEmpty(article.additionalInfo.suppliers) &&
          _.map(article.additionalInfo.suppliers, (supplier, key) => (
            <Box
              key={key}
              display="flex"
              bgcolor="grey.50"
              minHeight="5em"
              width="50%"
              alignItems="center"
              justifyContent="space-between"
              px="1em"
              py=".5em"
              mr="1rem"
              borderColor="inputBackground.main"
              borderRadius="4px">
              <Box sx={{width: '60%'}}>
                <Typography variant="subtitle2">
                  {supplier.name || '-'}
                </Typography>
                <Typography
                  color="text.secondary"
                  variant="body2"
                  component="p">
                  {t('Supplier Article')}{' '}
                  {supplier.number ? `#${supplier.number}` : ''}
                </Typography>
                <Typography
                  color="text.secondary"
                  variant="body2"
                  component="p">
                  {supplier.address?.fullName || '-'}
                </Typography>
                <Typography
                  color="text.secondary"
                  variant="body2"
                  component="p">
                  {supplier.phone}
                </Typography>
                <Typography
                  color="text.secondary"
                  variant="body2"
                  component="p">
                  {supplier.email}
                </Typography>
              </Box>
              {supplier.isPreferred && (
                <StatusChip
                  label={t('Preferred')}
                  color="success"
                  variant="filled"
                />
              )}
            </Box>
          ))}
        {_.isEmpty(article.additionalInfo.suppliers) && (
          <NoItemSection
            label={t('No suppliers yet. Please click the button below to add!')}
            illustration="supplier"
            buttonLabel={t('Add suppliers')}
            action={() => setOpenDialog(true)}
          />
        )}
        {openDialog && (
          <ArticleSuppliersForm
            isLoading={isLoading}
            originSuppliers={cloneDeep(article.additionalInfo.suppliers)}
            onCancel={() => setOpenDialog(false)}
            onSubmit={saveArticle}
          />
        )}
      </Box>
    </InfoCard>
  );
};
