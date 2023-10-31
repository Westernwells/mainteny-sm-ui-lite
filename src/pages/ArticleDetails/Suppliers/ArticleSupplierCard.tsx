import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import EditIcon from '@mui/icons-material/Create';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {StatusChip} from 'components/StatusChip';
import {InfoCard} from 'components/InfoCard';
import {ArticleView, SupplierRecord} from 'models/article';
import {useUpdateArticle} from 'hooks/reactQuery/useArticle';
import {NoItemSection} from '../NoItemSection';
import {ArticleSuppliersForm} from './ArticleSuppliersForm';

export const ArticleSupplierCard = ({article}: {article: ArticleView}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const {t} = useTranslation();
  const {mutateAsync: updateArticle, isLoading} = useUpdateArticle(
    t('Supplier updated successfully.'),
  );

  const saveArticle = async (suppliers: SupplierRecord[]) => {
    await updateArticle({articleId: article!.id, article: {suppliers}});
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
        {article.suppliers.length ? (
          article.suppliers.map((s, key) => (
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
                  {s.supplier.name || '-'}
                </Typography>
                <Typography
                  color="text.secondary"
                  variant="body2"
                  component="p">
                  {t('Supplier Article')} {s.number ? `#${s.number}` : ''}
                </Typography>
                <Typography
                  color="text.secondary"
                  variant="body2"
                  component="p">
                  {s.supplier.address?.fullName || '-'}
                </Typography>
                <Typography
                  color="text.secondary"
                  variant="body2"
                  component="p">
                  {s.supplier.contact.phone}
                </Typography>
                <Typography
                  color="text.secondary"
                  variant="body2"
                  component="p">
                  {s.supplier.contact.email}
                </Typography>
              </Box>
              {s.isPreferred && (
                <StatusChip
                  label={t('Preferred')}
                  color="success"
                  variant="filled"
                />
              )}
            </Box>
          ))
        ) : (
          <NoItemSection
            label={t('No suppliers yet. Please click the button below to add!')}
            illustration="supplier"
            buttonLabel={t('Add Suppliers')}
            action={() => setOpenDialog(true)}
          />
        )}
        {openDialog && (
          <ArticleSuppliersForm
            isLoading={isLoading}
            originSuppliers={article.suppliers.map((s) => ({
              ...s,
              supplierId: s.supplier.id,
            }))}
            onCancel={() => setOpenDialog(false)}
            onSubmit={saveArticle}
          />
        )}
      </Box>
    </InfoCard>
  );
};
