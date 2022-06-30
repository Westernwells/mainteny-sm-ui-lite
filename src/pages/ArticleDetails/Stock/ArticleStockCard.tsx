import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import EditIcon from '@mui/icons-material/Create';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import useTheme from '@mui/material/styles/useTheme';
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import ViewComfyIcon from '@mui/icons-material/ViewComfy';
import Filter1Icon from '@mui/icons-material/Filter1';
import {useFormik} from 'formik';
import _ from 'lodash';
import {ArticleView} from '../../../models/article';
import {useUpdateArticle} from '../../../hooks/reactQuery/useArticle';
import {CardProps} from '../../../components/CardProps';
import {NoItemSection} from '../NoItemSection';
import {InfoCard} from '../../../components/InfoCard';
import {EditStockForm} from './EditStockForm';
import {Dialog} from '../../../components/Dialog';
import {ArticleStockFormModel} from '../../../models/articleForm';
import {makeAmountRecord} from '../../../utils/currency';

export const ArticleStockCard = ({article}: {article: ArticleView}) => {
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const {t} = useTranslation();
  const {mutateAsync: updateArticle, isLoading} = useUpdateArticle(
    t('Article is updated successfully'),
  );

  const formik = useFormik<ArticleStockFormModel>({
    initialValues: {
      currentStock: article.stock.currentStock,
      maxStock: article.stock.maxStock,
      minOrderQuantity: article.stock.minOrderQuantity,
      minStock: article.stock.minStock,
    },
    onSubmit: () => {},
  });

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
      stock: {
        currentStock: formik.values.currentStock,
        maxStock: formik.values.maxStock,
        minOrderQuantity: formik.values.minOrderQuantity,
        minStock: formik.values.minStock,
      },
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

  const stockItems = [
    {
      label: t('Minimum Stock'),
      icon: <ViewAgendaIcon sx={{color: theme.palette.info.dark}} />,
      body: article.stock.minStock,
    },
    {
      label: t('Current Stock'),
      icon: <ViewWeekIcon sx={{color: theme.palette.info.dark}} />,
      body: article.stock.currentStock,
    },
    {
      label: t('Maximum Stock'),
      icon: <ViewComfyIcon sx={{color: theme.palette.info.dark}} />,
      body: article.stock.maxStock,
    },
    {
      label: t('Minimum Order Quantity'),
      icon: <Filter1Icon sx={{color: theme.palette.info.dark}} />,
      body: article.stock.minOrderQuantity,
    },
  ];

  return (
    <InfoCard
      containerStyles={{mb: '1.2rem'}}
      headerActionIcon={<EditIcon />}
      handleAction={() => setOpenDialog(true)}
      showHeaderBackground
      header={<Typography variant="subtitle1">{t('Stock Info')}</Typography>}>
      <Box display="flex" flexWrap="wrap">
        {article.stock &&
          _.map(stockItems, (item, key) => (
            <CardProps
              key={key}
              label={item.label}
              labelStyle={{textTransform: 'uppercase'}}
              icon={item.icon}
              iconBackground={theme.palette.info.outlinedHoverBg}
              containerStyles={{mt: '1em', width: '33%'}}
              bodyText={item.body}
            />
          ))}
        {!article.stock && (
          <NoItemSection
            label={t(
              'No stock info yet. Please click the button below to add!',
            )}
            buttonLabel={t('+ Add stock info')}
            action={() => setOpenDialog(true)}
          />
        )}
      </Box>
      <Dialog
        title={t('Edit Stock Information')}
        isSaving={isLoading}
        onCancel={() => setOpenDialog(false)}
        onSave={saveArticle}
        dialogProps={{
          open: openDialog || false,
        }}>
        <EditStockForm
          formik={formik}
          containerStyles={{display: 'flex', flexWrap: 'wrap'}}
        />
      </Dialog>
    </InfoCard>
  );
};
