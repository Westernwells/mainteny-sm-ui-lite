import {useState} from 'react';
import {useTranslation} from 'react-i18next';
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
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import _ from 'lodash';
import * as Yup from 'yup';
import {useFormik} from 'formik';
import {ArticleView} from 'models/article';
import {ArticleBasicFormModel} from 'models/articleForm';
import {Dialog} from 'components/Dialog';
import {useUpdateArticle} from 'hooks/reactQuery/useArticle';
import {useEffectAfterMount} from 'hooks/useEffectAfterMount';
import {CardProps} from 'components/CardProps';
import {InfoCard} from 'components/InfoCard';
import {
  amountRecordForBackend,
  currencyFactor,
  formatNetAmount,
  makeAmountRecord,
  useCurrentCurrency,
} from 'utils/currency';
import {convertToText} from 'utils/utils';
import {handleCostPackageValidation} from 'utils/article-utils';
import {EditBasicInfoForm} from './EditBasicInfoForm';

const validationSchema = Yup.object().shape({
  category: Yup.string().nullable(),
  name: Yup.string().nullable().required('Name is required'),
  externalId: Yup.string().nullable(),
  type: Yup.string().nullable().required('Type is required'),
  unit: Yup.string().nullable(),
  unitPurchaseVat: Yup.number()
    .required('Purchase VAT is required')
    .min(0)
    .max(100),
  unitSellingVat: Yup.number()
    .required('Selling VAT is required')
    .min(0)
    .max(100),
  unitSellingAmount: Yup.number()
    .nullable()
    .required('Selling price is required'),
  costPackage: Yup.object().shape({
    // amount should be required and sum of labor and material should be equal to unitSellingAmount
    labor: Yup.object().shape({
      value: Yup.number().test(
        'value',
        'The sum of labor and material prices should be equal to Selling price',
        handleCostPackageValidation,
      ),
    }),
    material: Yup.object().shape({
      value: Yup.number().test(
        'value',
        'The sum of labor and material prices should be equal to Selling price',
        handleCostPackageValidation,
      ),
    }),
  }),
});

export const ArticleBasicInfoCard = ({article}: {article: ArticleView}) => {
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const {t} = useTranslation();
  const currentCurrency = useCurrentCurrency();
  const {mutateAsync: updateArticle, isLoading} = useUpdateArticle(
    t('Article updated successfully'),
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
      unitPurchaseVat: article.unitPurchaseAmount
        ? article.unitPurchaseAmount.percentageVat
        : 0,
      unitPurchaseAmount: article.unitPurchaseAmount
        ? Math.round(
            article.unitPurchaseAmount.netAmount /
              currencyFactor(article.unitPurchaseAmount),
          )
        : 0,
      unitPurchaseAmountCurrency: article.unitPurchaseAmount
        ? article.unitPurchaseAmount.currency
        : article.unitSellingAmount.currency,
      unitSellingVat: article.unitSellingAmount.percentageVat,
      unitSellingAmount: Math.round(
        article.unitSellingAmount.netAmount /
          currencyFactor(article.unitSellingAmount),
      ),
      unitSellingAmountCurrency: article.unitSellingAmount.currency,
      costPackage: article.additionalInfo.costPackage
        ? {
            labor: {
              ...article.additionalInfo.costPackage.labor,
              value:
                (article.additionalInfo.costPackage.labor?.value ?? 0) /
                currencyFactor(article.additionalInfo.costPackage.labor),
            },
            material: {
              ...article.additionalInfo.costPackage.material,
              value:
                (article.additionalInfo.costPackage.material?.value ?? 0) /
                currencyFactor(article.additionalInfo.costPackage.material),
            },
          }
        : undefined,
    },
    onSubmit: () => {},
    validationSchema,
  });

  const saveArticle = async () => {
    const factor = currencyFactor({currency: currentCurrency.code});
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
      unitPurchaseAmount: amountRecordForBackend(
        makeAmountRecord(
          formik.values.unitPurchaseAmount,
          article.unitPurchaseAmount
            ? article.unitPurchaseAmount.currency
            : article.unitSellingAmount.currency,
          formik.values.unitPurchaseVat,
        ),
      ),
      unitSellingAmount: amountRecordForBackend(
        makeAmountRecord(
          formik.values.unitSellingAmount,
          article.unitSellingAmount.currency,
          formik.values.unitSellingVat,
        ),
      ),
      costPackage: {
        ...formik.values.costPackage,
        labor: {
          ...formik.values.costPackage?.labor,
          value: (formik.values.costPackage?.labor?.value ?? 0) * factor,
          currency: currentCurrency.code,
        },
        material: {
          ...formik.values.costPackage?.material,
          value: (formik.values.costPackage?.material?.value ?? 0) * factor,
          currency: currentCurrency.code,
        },
      },
    };
    await updateArticle({articleId: article!.id, article: temp});
    setOpenDialog(false);
  };

  useEffectAfterMount(() => {
    // whenever unitSellingAmount changes, update costPackage labor and material to 50% 50% of unitSellingAmount
    formik.setFieldValue('costPackage', {
      labor: {
        value: formik.values.unitSellingAmount * 0.5,
        currency: currentCurrency.code,
      },
      material: {
        value: formik.values.unitSellingAmount * 0.5,
        currency: currentCurrency.code,
      },
    });
  }, [formik.values.unitSellingAmount]);

  const handleCancel = () => {
    setOpenDialog(false);
  };

  const basicInfoItems = [
    {
      label: t('Category'),
      icon: (
        <RadioButtonUncheckedRoundedIcon
          sx={{color: theme.palette.info.dark}}
        />
      ),
      body: article?.category,
    },
    {
      label: t('Model'),
      icon: (
        <DocumentScannerRoundedIcon sx={{color: theme.palette.info.dark}} />
      ),
      body: article?.model,
    },
    {
      label: t('Manufacturer'),
      icon: <AssignmentIndRoundedIcon sx={{color: theme.palette.info.dark}} />,
      body: article?.manufacturer,
    },
    {
      label: t('Unit'),
      icon: <ExpandRoundedIcon sx={{color: theme.palette.info.dark}} />,
      body: article?.unit,
    },
    {
      label: t('Selling Price'),
      icon: <LocalOfferRoundedIcon sx={{color: theme.palette.info.dark}} />,
      body: formatNetAmount(article.unitSellingAmount),
    },
    {
      label: t('Purchase Price'),
      icon: <LocalOfferRoundedIcon sx={{color: theme.palette.info.dark}} />,
      body: formatNetAmount(article.unitPurchaseAmount),
    },
    {
      label: t('Storage Location'),
      icon: <FmdGoodRoundedIcon sx={{color: theme.palette.info.dark}} />,
      body: article?.storageLocation || '-',
    },
    {
      label: t('Selling VAT'),
      icon: <LocalOfferRoundedIcon sx={{color: theme.palette.info.dark}} />,
      body: article?.unitSellingAmount.percentageVat.toString().concat('%'),
    },
    {
      label: t('Purchase VAT'),
      icon: <LocalOfferRoundedIcon sx={{color: theme.palette.info.dark}} />,
      body: article.unitPurchaseAmount
        ? article?.unitPurchaseAmount.percentageVat.toString().concat('%')
        : 0,
    },
    {
      label: t('Type'),
      icon: <InfoOutlinedIcon sx={{color: theme.palette.info.dark}} />,
      body: article?.type ? t(convertToText(article.type)) : '-',
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
            bodyStyle={{overflowWrap: 'anywhere'}}
            bodyText={item.body}
          />
        ))}
      </Box>
      <Dialog
        title={t('Edit Basic Information')}
        isSaving={isLoading}
        onCancel={handleCancel}
        disableSaveBtn={
          !!Object.keys(formik.errors).length || !formik.values.type
        }
        onSave={saveArticle}
        dialogProps={{
          open: openDialog || false,
          maxWidth: 'lg',
        }}>
        <EditBasicInfoForm
          containerStyles={{
            width: '49%',
            pr: '1rem',
            mr: '0.25rem',
            my: '0.5rem',
          }}
          formik={formik}
        />
      </Dialog>
    </InfoCard>
  );
};
