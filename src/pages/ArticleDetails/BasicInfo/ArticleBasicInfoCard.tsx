import {useEffect, useState} from 'react';
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
import Tag from '@mui/icons-material/Tag';
import _ from 'lodash';
import * as Yup from 'yup';
import {useFormik} from 'formik';
import {ArticleView, UpdateArticleRecord} from 'models/article';
import {ArticleBasicFormModel} from 'models/articleForm';
import {Dialog} from 'components/Dialog';
import {useArticles, useUpdateArticle} from 'hooks/reactQuery/useArticle';
import {CardProps} from 'components/CardProps';
import {InfoCard} from 'components/InfoCard';
import {
  amountRecordForBackend,
  currencyFactor,
  formatCurrency,
  makeAmountRecord,
} from 'utils/currency';
import {convertToText} from 'utils/utils';
import {createEmptyResource} from 'utils/paging';
import {getPlainStringFromHtml, isPlainString} from 'utils/rich-field-string';
import DOMPurify from 'dompurify';
import {EditBasicInfoForm} from './EditBasicInfoForm';

const isExternalIdUnique = async (resource: ArticleView[], value?: string) => {
  if (!value) {
    return true;
  }
  try {
    return !(resource && resource.some((item) => item.externalId === value));
  } catch (error) {
    console.error('Error checking externalId uniqueness:', error);
    return true;
  }
};

export const ArticleBasicInfoCard = ({article}: {article: ArticleView}) => {
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const {t} = useTranslation();
  const {mutateAsync: updateArticle, isLoading} = useUpdateArticle(
    t('Article updated successfully.'),
  );

  const [initValue, setInitValue] = useState('');
  const [updatedValue, setUpdatedValue] = useState('');

  const {data: articleResource = createEmptyResource<ArticleView>(50)} =
    useArticles(
      {
        pageIndex: 0,
        pageSize: 50,
        query: updatedValue,
        type: [],
      },
      {keepPreviousData: true},
      true,
    );

  const validationSchema = Yup.object().shape({
    category: Yup.string().nullable(),
    name: Yup.string().test('checkName', 'Name is required', (value) => {
      if (
        !value ||
        (isPlainString(value) ? value : getPlainStringFromHtml(value)) === ''
      ) {
        return false;
      }
      return true;
    }),
    externalId: Yup.string()
      .nullable()
      .test(
        'checkExternalId',
        'This ID is already taken. Please enter a different one.',
        async (value) => {
          if (value !== initValue) {
            return isExternalIdUnique(articleResource.data, value!);
          }
          return true;
        },
      ),
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
      laborPercentage: Yup.number(),
      materialPercentage: Yup.number(),
    }),
  });

  const initialValues = {
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
    unitPurchaseAmount: (article.unitPurchaseAmount
      ? article.unitPurchaseAmount.netAmount /
        currencyFactor(article.unitPurchaseAmount)
      : 0
    ).toFixed(2),
    unitPurchaseAmountCurrency: article.unitPurchaseAmount
      ? article.unitPurchaseAmount.currency
      : article.unitSellingAmount.currency,
    unitSellingVat: article.unitSellingAmount.percentageVat,
    unitSellingAmount: (article.unitSellingAmount
      ? article.unitSellingAmount.netAmount /
        currencyFactor(article.unitSellingAmount)
      : 0
    ).toFixed(2),
    unitSellingAmountCurrency: article.unitSellingAmount.currency,
    costPackage: {
      laborPercentage: article.additionalInfo?.costPackage?.laborPercentage,
      materialPercentage:
        article.additionalInfo?.costPackage?.materialPercentage,
    },
  };

  const formik = useFormik<ArticleBasicFormModel>({
    initialValues: {
      ...initialValues,
    },
    onSubmit: () => {},
    validationSchema,
  });

  useEffect(() => {
    setUpdatedValue(formik.values.externalId);
  }, [formik]);

  // Re-format the amount(s) after article edit
  useEffect(() => {
    formik.setValues({
      ...formik.values,
      unitPurchaseAmount: (article.unitPurchaseAmount
        ? article.unitPurchaseAmount.netAmount /
          currencyFactor(article.unitPurchaseAmount)
        : 0
      ).toFixed(2),
      unitSellingAmount: (article.unitSellingAmount
        ? article.unitSellingAmount.netAmount /
          currencyFactor(article.unitSellingAmount)
        : 0
      ).toFixed(2),
      costPackage: {
        laborPercentage: article.additionalInfo.costPackage?.laborPercentage,
        materialPercentage:
          article.additionalInfo.costPackage?.materialPercentage,
      },
      externalId: article.externalId,
    });
    setInitValue(article.externalId);
  }, [article]);

  const handleCancel = () => {
    formik.resetForm({});
    setOpenDialog(false);
  };

  const saveArticle = async () => {
    const temp: UpdateArticleRecord = {
      category: formik.values.category,
      manufacturer: formik.values.manufacturer,
      model: formik.values.model,
      name: formik.values.name,
      externalId: formik.values.externalId,
      storageLocation: formik.values.storageLocation,
      type: formik.values.type.toUpperCase(),
      unit: formik.values.unit,
      unitPurchaseAmount: amountRecordForBackend(
        makeAmountRecord(
          formik.values.unitPurchaseAmount as number,
          article.unitPurchaseAmount
            ? article.unitPurchaseAmount.currency
            : article.unitSellingAmount.currency,
          formik.values.unitPurchaseVat,
        ),
      ),
      unitSellingAmount: amountRecordForBackend(
        makeAmountRecord(
          formik.values.unitSellingAmount as number,
          article.unitSellingAmount.currency,
          formik.values.unitSellingVat,
        ),
      ),
      costPackage: {
        laborPercentage: formik.values.costPackage?.laborPercentage,
        materialPercentage: formik.values.costPackage?.materialPercentage,
      },
    };
    await updateArticle({articleId: article!.id, article: temp});
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
      body: formatCurrency(
        article.unitSellingAmount.netAmount /
          10 ** article.unitSellingAmount.fractionDigits!,
      ),
    },
    {
      label: t('Purchase Price'),
      icon: <LocalOfferRoundedIcon sx={{color: theme.palette.info.dark}} />,
      body: formatCurrency(
        (article.unitPurchaseAmount?.netAmount ?? 0) /
          10 ** (article.unitPurchaseAmount?.fractionDigits ?? 0),
      ),
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
    {
      label: t('Article ID'),
      icon: <Tag sx={{color: theme.palette.info.dark}} />,
      body: article.externalId ? article.externalId : '-',
    },
  ];

  return (
    <InfoCard
      containerStyles={{mb: '1.2rem'}}
      headerActionIcon={<EditIcon />}
      handleAction={() => setOpenDialog(true)}
      showHeaderBackground
      header={
        <Typography
          variant="subtitle1"
          dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(article?.name)}}
        />
      }>
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
        disableSaveBtn={!!Object.keys(formik.errors).length || !formik.dirty}
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
          articleCostPackage={article?.additionalInfo?.costPackage}
        />
      </Dialog>
    </InfoCard>
  );
};
