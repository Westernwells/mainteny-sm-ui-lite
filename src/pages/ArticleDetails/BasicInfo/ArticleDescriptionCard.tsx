import {useState} from 'react';
import EditIcon from '@mui/icons-material/Create';
import Typography from '@mui/material/Typography';
import {useFormik} from 'formik';
import {FormInput} from '../../../components/form/FormInput';
import {ArticleView} from '../../../models/article';
import {Dialog} from '../../../components/Dialog';
import {InfoCard} from '../../../components/InfoCard';
import {useUpdateArticle} from '../../../hooks/reactQuery/useArticle';
import {NoItemSection} from '../NoItemSection';
import {ArticleDescriptionFormModel} from '../../../models/articleForm';

export const ArticleDescriptionCard = ({article}: {article: ArticleView}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const {mutateAsync: updateArticle, isLoading} = useUpdateArticle(
    'Article is updated successfully',
  );

  const formik = useFormik<ArticleDescriptionFormModel>({
    initialValues: {
      description: article.description,
    },
    onSubmit: () => {},
  });

  const saveArticle = async () => {
    const temp = {
      category: article.category,
      description: formik.values.description,
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
      containerStyles={{mb: '1.2rem'}}
      headerActionIcon={<EditIcon />}
      handleAction={() => setOpenDialog(true)}
      showHeaderBackground
      header={<Typography variant="subtitle1">Description</Typography>}>
      {article.description && (
        <Typography variant="inherit">{article.description}</Typography>
      )}
      {!article.description && (
        <NoItemSection
          placeholder="description"
          action={() => setOpenDialog(true)}
        />
      )}
      <Dialog
        title="Edit Description"
        isSaving={isLoading}
        onCancel={() => setOpenDialog(false)}
        onSave={saveArticle}
        dialogProps={{
          open: openDialog || false,
        }}>
        <FormInput
          containerStyles={{width: '100%'}}
          props={{
            name: 'description',
            label: 'description',
            placeholder:
              'e.g. Flat cable used for door engines from the following suppliers.....',
            multiline: true,
            rows: 10,
            minRows: 5,
            type: 'text',
            value: formik.values.description,
            onBlur: formik.handleBlur,
            onChange: formik.handleChange,
          }}
        />
      </Dialog>
    </InfoCard>
  );
};
