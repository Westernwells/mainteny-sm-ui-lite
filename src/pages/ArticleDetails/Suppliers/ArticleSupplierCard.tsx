import {useState} from 'react';
import EditIcon from '@mui/icons-material/Create';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import _ from 'lodash';
import {StatusChip} from '../../../components/StatusChip';
import {NoItemSection} from '../NoItemSection';
import {InfoCard} from '../../../components/InfoCard';
import {ArticleView, SupplierRecord} from '../../../models/article';
import {ArticleSuppliersForm} from './ArticleSuppliersForm';
import {Dialog} from '../../../components/Dialog';
import {useUpdateArticle} from '../../../hooks/reactQuery/useArticle';

export const ArticleSupplierCard = ({article}: {article: ArticleView}) => {
  const [suppliers, setSuppliers] = useState<SupplierRecord[]>(
    article.additionalInfo.suppliers,
  );
  const [openDialog, setOpenDialog] = useState(false);
  const {mutateAsync: updateArticle, isLoading} = useUpdateArticle(
    'Article is updated successfully',
  );

  const saveArticle = async () => {
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

  const updateSuppliers = (result: SupplierRecord[]) => {
    setSuppliers(result);
  };

  return (
    <InfoCard
      containerStyles={{mb: '1.2rem'}}
      headerActionIcon={<EditIcon />}
      handleAction={() => setOpenDialog(true)}
      showHeaderBackground
      header={<Typography variant="subtitle1">Suppliers</Typography>}>
      <Box display="flex" justifyContent="space-between">
        {!_.isEmpty(article.additionalInfo.suppliers) &&
          _.map(article.additionalInfo.suppliers, (supplier, key) => (
            <Box
              key={key}
              display="flex"
              bgcolor="grey.200"
              minHeight="5em"
              width="50%"
              alignItems="center"
              justifyContent="space-between"
              px="1em"
              py=".5em"
              mr="1.2rem"
              border="1px solid"
              borderColor="inputBackground.main"
              borderRadius="4px">
              <Box color="text.secondary">
                <Typography variant="caption">
                  {supplier.name || '-'}
                </Typography>
                <Typography variant="body2" component="p">
                  {supplier.address.fullName || '-'}
                </Typography>
                <Typography variant="body2" component="p">
                  {supplier.phone}
                </Typography>
              </Box>
              {supplier.isPreferred && (
                <StatusChip
                  label="Preferred"
                  color="success"
                  variant="filled"
                />
              )}
            </Box>
          ))}
        {_.isEmpty(article.additionalInfo.suppliers) && (
          <NoItemSection
            placeholder="suppliers"
            action={() => setOpenDialog(true)}
          />
        )}
        <Dialog
          title="Edit Suppliers Information"
          isSaving={isLoading}
          onCancel={() => {
            setOpenDialog(false);
            setSuppliers(article.additionalInfo.suppliers);
          }}
          onSave={saveArticle}
          dialogProps={{
            open: openDialog || false,
          }}>
          <ArticleSuppliersForm
            suppliers={suppliers}
            updateSuppliers={updateSuppliers}
          />
        </Dialog>
      </Box>
    </InfoCard>
  );
};
