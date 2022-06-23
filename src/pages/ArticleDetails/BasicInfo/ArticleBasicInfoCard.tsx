import {useState} from 'react';
import useTheme from '@mui/material/styles/useTheme';
import EditIcon from '@mui/icons-material/Create';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import DocumentScannerRoundedIcon from '@mui/icons-material/DocumentScannerRounded';
import AssignmentIndRoundedIcon from '@mui/icons-material/AssignmentIndRounded';
import ExpandRoundedIcon from '@mui/icons-material/ExpandRounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import FmdGoodRoundedIcon from '@mui/icons-material/FmdGoodRounded';
import _ from 'lodash';
import * as Yup from 'yup';
import {useFormik} from 'formik';
import {ArticleType, ArticleView} from '../../../models/article';
import {ArticleBasicFormModel} from '../../../models/articleForm';
import {Dialog} from '../../../components/Dialog';
import {ArticleBasicInfoForm} from './ArticleBasicInfoForm';
import {convertToText} from '../../../utils/utils';
import {useUpdateArticle} from '../../../hooks/reactQuery/useArticle';
import {CardProps} from '../../../components/CardProps';
import {InfoCard} from '../../../components/InfoCard';
import {netAmount} from '../../../utils/currency';

const validationSchema = Yup.object().shape({
  category: Yup.string().nullable().required('Category is required'),
  name: Yup.string().nullable().required('Name is required'),
  externalId: Yup.string().nullable().required('External Id is required'),
  type:
    Yup.string().nullable().required('Type is required') &&
    Yup.string().notOneOf([convertToText(ArticleType.PACKAGE)]),
  unit: Yup.string().nullable().required('Unit is required'),
  unitSellingVat: Yup.number().nullable().required('Selling VAT is required'),
  unitSellingAmount: Yup.number()
    .nullable()
    .required('Selling price is required'),
});

export const ArticleBasicInfoCard = ({article}: {article: ArticleView}) => {
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const {mutateAsync: updateArticle, isLoading} = useUpdateArticle(
    'Article is updated successfully',
  );

  const formik = useFormik<ArticleBasicFormModel>({
    initialValues: {
      category: article.category,
      manufacturer: article.manufacturer,
      model: article.model,
      name: article.name,
      externalId: article.externalId,
      storageLocation: article.storageLocation,
      type: article.type,
      unit: article.unit,
      unitPurchaseVat: article.unitPurchaseAmount.percentageVat,
      unitPurchaseAmount: article.unitPurchaseAmount.netAmount,
      unitSellingVat: article.unitSellingAmount.percentageVat,
      unitSellingAmount: article.unitSellingAmount.netAmount,
    },
    onSubmit: () => {},
    validationSchema,
  });

  const saveArticle = async () => {
    const temp = {
      category: formik.values.category,
      description: article.description,
      manufacturer: formik.values.manufacturer,
      model: formik.values.model,
      name: formik.values.name,
      externalId: formik.values.externalId,
      pictureUrls: article.additionalInfo.pictureUrls,
      qrCode: article.additionalInfo.qrCode,
      serviceCompanyId: article.serviceCompanyId!,
      stock: article.stock,
      storageLocation: formik.values.storageLocation,
      subCategory: article.subCategory,
      suppliers: article.additionalInfo.suppliers || [],
      type: formik.values.type.toUpperCase(),
      unit: formik.values.unit,
      unitPurchaseAmount: {
        currency: article.unitPurchaseAmount.currency,
        netAmount: formik.values.unitPurchaseAmount,
        percentageVat: formik.values.unitPurchaseVat,
      },
      unitSellingAmount: {
        currency: article.unitSellingAmount.currency,
        netAmount: formik.values.unitSellingAmount,
        percentageVat: formik.values.unitSellingVat,
      },
    };
    await updateArticle({articleId: article!.id, article: temp});
    setOpenDialog(false);
  };

  const basicInfoItems = [
    {
      label: 'Category',
      icon: (
        <RadioButtonUncheckedRoundedIcon
          sx={{color: theme.palette.info.dark}}
        />
      ),
      body: article?.category,
    },
    {
      label: 'Model',
      icon: (
        <DocumentScannerRoundedIcon sx={{color: theme.palette.info.dark}} />
      ),
      body: article?.model,
    },
    {
      label: 'Manufacturer',
      icon: <AssignmentIndRoundedIcon sx={{color: theme.palette.info.dark}} />,
      body: article?.manufacturer,
    },
    {
      label: 'Unit',
      icon: <ExpandRoundedIcon sx={{color: theme.palette.info.dark}} />,
      body: article?.unit,
    },
    {
      label: 'Selling Price',
      icon: <LocalOfferRoundedIcon sx={{color: theme.palette.info.dark}} />,
      body: netAmount(article.unitSellingAmount),
    },
    {
      label: 'Purchase Price',
      icon: <LocalOfferRoundedIcon sx={{color: theme.palette.info.dark}} />,
      body: netAmount(article.unitPurchaseAmount),
    },
    {
      label: 'Storage Location',
      icon: <FmdGoodRoundedIcon sx={{color: theme.palette.info.dark}} />,
      body: article?.storageLocation || '-',
    },
    {
      label: 'Selling VAT',
      icon: <LocalOfferRoundedIcon sx={{color: theme.palette.info.dark}} />,
      body: article?.unitSellingAmount.percentageVat,
    },
    {
      label: 'Purchase VAT',
      icon: <LocalOfferRoundedIcon sx={{color: theme.palette.info.dark}} />,
      body: article?.unitPurchaseAmount.percentageVat,
    },
  ];

  return (
    <InfoCard
      containerStyles={{mb: '1.2rem'}}
      headerActionIcon={<EditIcon />}
      handleAction={() => setOpenDialog(true)}
      showHeaderBackground
      header={<Typography variant="subtitle1">{article?.name}</Typography>}>
      <Box display="flex" flexWrap="wrap">
        {_.map(basicInfoItems, (item, key) => (
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
      </Box>
      <Dialog
        title="Edit Basic Information"
        isSaving={isLoading}
        onCancel={() => setOpenDialog(false)}
        disableSaveBtn={!!Object.keys(formik.errors).length}
        onSave={saveArticle}
        dialogProps={{
          open: openDialog || false,
        }}>
        <ArticleBasicInfoForm
          containerStyles={{width: '50%', pr: '1rem'}}
          formik={formik}
        />
      </Dialog>
    </InfoCard>
  );
};
