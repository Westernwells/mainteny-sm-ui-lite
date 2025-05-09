import AssignmentIndRoundedIcon from '@mui/icons-material/AssignmentIndRounded';
import EditIcon from '@mui/icons-material/Create';
import DocumentScannerRoundedIcon from '@mui/icons-material/DocumentScannerRounded';
import ExpandRoundedIcon from '@mui/icons-material/ExpandRounded';
import FmdGoodRoundedIcon from '@mui/icons-material/FmdGoodRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import TagIcon from '@mui/icons-material/Tag';
import Box from '@mui/material/Box';
import useTheme from '@mui/material/styles/useTheme';
import Typography from '@mui/material/Typography';
import {CardProps} from 'components/CardProps';
import {Dialog} from 'components/Dialog';
import {InfoCard} from 'components/InfoCard';
import {useFormik} from 'formik';
import {useArticles, useUpdateArticle} from 'hooks/reactQuery/useArticle';
import {useVats} from 'hooks/reactQuery/useVats';
import _ from 'lodash';
import {ArticleType, ArticleView, UpdateArticleRecord} from 'models/article';
import {ArticleBasicFormModel} from 'models/articleForm';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {getArticleTypes} from 'utils/article-utils';
import {
  amountRecordForBackendWithVatId,
  currencyFactor,
  formatCurrency,
  makeAmountRecordWithVatId,
} from 'utils/currency';
import {createEmptyResource} from 'utils/paging';
import {getPlainStringFromHtml, isPlainString} from 'utils/rich-field-string';
import {convertToText} from 'utils/utils';
import * as Yup from 'yup';
import {stripHtmlTags} from 'models/text-block';
import TagGroup from 'components/Tag/TagGroup';
import {TagEntityType} from 'models/tag';
import Tag from 'components/Tag';
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
  const {data: taxRates} = useVats();

  const [initValue, setInitValue] = useState('');
  const [updatedValue, setUpdatedValue] = useState('');

  const {data: articleResource = createEmptyResource<ArticleView>(50)} =
    useArticles(
      {
        pageIndex: 0,
        pageSize: 50,
        query: updatedValue,
        type: getArticleTypes({excludeTypes: [ArticleType.MIX]}),
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
    unitPurchaseVat: Yup.string().nullable(),
    unitSellingVat: Yup.string().required('Selling VAT is required'),
    unitSellingAmount: Yup.number()
      .nullable()
      .required('Selling price is required'),
    costPackage: Yup.object().shape({
      laborPercentage: Yup.number(),
      materialPercentage: Yup.number(),
      tags: Yup.array(),
    }),
  });

  const initialValues = {
    category: article.category,
    manufacturer: article.manufacturer,
    model: article.model,
    name: stripHtmlTags(article.name || ''),
    externalId: article.externalId,
    storageLocation: article.storageLocation,
    type: article.type,
    unit: article.unit,
    unitPurchaseVat: article.unitPurchaseAmount?.vatId ?? '',
    unitPurchaseAmount: (article.unitPurchaseAmount
      ? (article.unitPurchaseAmount.netAmount ?? 0) /
        currencyFactor(article.unitPurchaseAmount)
      : 0
    ).toFixed(2),
    unitPurchaseAmountCurrency: article.unitPurchaseAmount
      ? article.unitPurchaseAmount.currency
      : article.unitSellingAmount.currency,
    unitSellingVat: article.unitSellingAmount.vatId ?? '',
    unitSellingAmount: (article.unitSellingAmount
      ? (article.unitSellingAmount.netAmount ?? 0) /
        currencyFactor(article.unitSellingAmount)
      : 0
    ).toFixed(2),
    unitSellingAmountCurrency: article.unitSellingAmount.currency,
    costPackage: {
      laborPercentage: article.additionalInfo?.costPackage?.laborPercentage,
      materialPercentage:
        article.additionalInfo?.costPackage?.materialPercentage,
    },
    tags: article.additionalInfo?.tags,
  };

  const formik = useFormik<ArticleBasicFormModel>({
    initialValues: {
      ...initialValues,
    },
    enableReinitialize: true,
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
        ? (article.unitPurchaseAmount.netAmount ?? 0) /
          currencyFactor(article.unitPurchaseAmount)
        : 0
      ).toFixed(2),
      unitSellingAmount: (article.unitSellingAmount
        ? (article.unitSellingAmount.netAmount ?? 0) /
          currencyFactor(article.unitSellingAmount)
        : 0
      ).toFixed(2),
      costPackage: {
        laborPercentage: article.additionalInfo?.costPackage?.laborPercentage,
        materialPercentage:
          article.additionalInfo?.costPackage?.materialPercentage,
      },
      externalId: article.externalId,
      unitPurchaseVat: article.unitPurchaseAmount?.vatId ?? '',
      unitSellingVat: article.unitSellingAmount?.vatId ?? '',
    });
    setInitValue(article.externalId);
  }, [article]);

  const handleCancel = () => {
    formik.resetForm({});
    setOpenDialog(false);
  };

  const saveArticle = async () => {
    const unitPurchaseVat = taxRates?.find(
      (rate) => rate.id === formik.values.unitPurchaseVat,
    );

    const unitSellingVat = taxRates?.find(
      (rate) => rate.id === formik.values.unitSellingVat,
    );
    const temp: UpdateArticleRecord = {
      category: formik.values.category,
      manufacturer: formik.values.manufacturer,
      model: formik.values.model,
      name: formik.values.name,
      externalId: formik.values.externalId,
      storageLocation: formik.values.storageLocation,
      type: formik.values.type,
      unit: formik.values.unit,
      unitPurchaseAmount: amountRecordForBackendWithVatId(
        makeAmountRecordWithVatId(
          formik.values.unitPurchaseAmount as number,
          article.unitPurchaseAmount
            ? article.unitPurchaseAmount.currency
            : article.unitSellingAmount.currency,
          unitPurchaseVat?.percentage ?? 0,
          unitPurchaseVat?.id ?? '',
          unitPurchaseVat?.name ?? '',
        ),
      ),
      unitSellingAmount: amountRecordForBackendWithVatId(
        makeAmountRecordWithVatId(
          formik.values.unitSellingAmount as number,
          article.unitSellingAmount.currency,
          unitSellingVat?.percentage ?? 0,
          unitSellingVat?.id ?? '',
          unitSellingVat?.name ?? '',
        ),
      ),
      costPackage: {
        laborPercentage: formik.values.costPackage?.laborPercentage,
        materialPercentage: formik.values.costPackage?.materialPercentage,
      },
      tags: (formik.values.tags || []).map((tag) => tag.id),
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
        (article.unitSellingAmount.netAmount ?? 0) /
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
      body: article?.unitSellingAmount.percentageVat?.toString().concat('%'),
    },
    {
      label: t('Purchase VAT'),
      icon: <LocalOfferRoundedIcon sx={{color: theme.palette.info.dark}} />,
      body: article.unitPurchaseAmount
        ? article?.unitPurchaseAmount.percentageVat?.toString().concat('%')
        : 0,
    },
    {
      label: t('Type'),
      icon: <InfoOutlinedIcon sx={{color: theme.palette.info.dark}} />,
      body: article?.type ? t(convertToText(article.type)) : '-',
    },
    {
      label: t('Article ID'),
      icon: <TagIcon sx={{color: theme.palette.info.dark}} />,
      body: article.externalId ? article.externalId : '-',
    },
  ];

  const [firstTag, secondTag, ...groupTags] =
    article.additionalInfo?.tags || [];
  const showTags = [firstTag, secondTag];

  return (
    <InfoCard
      containerStyles={{mb: '1.2rem'}}
      headerActionIcon={<EditIcon />}
      handleAction={() => setOpenDialog(true)}
      showHeaderBackground
      header={<Typography>{stripHtmlTags(article?.name || '')}</Typography>}>
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
        <Box sx={{display: 'flex', alignItems: 'center'}}>
          <Box
            sx={{
              backgroundColor: theme.palette.info.outlinedHoverBg,
              p: '0.7em',
              display: 'flex',
              justifyContent: 'center',
              mr: '0.8em',
            }}>
            <LabelOutlinedIcon sx={{color: theme.palette.info.dark}} />
          </Box>

          <Box>
            <Typography
              component="div"
              variant="caption"
              color={theme.palette.text.secondary}>
              {t('Tags')}
            </Typography>

            <Box
              sx={{
                display: 'flex',
                gap: theme.spacing(0.5),
                alignItems: 'center',
              }}>
              {showTags.map((tag) => (
                <Tag
                  key={`article-tag-${tag.id}`}
                  {...tag}
                  entity={TagEntityType.ARTICLE}
                />
              ))}
              {groupTags.length > 0 && (
                <TagGroup tags={groupTags} showGroupTagsPopover />
              )}
            </Box>
          </Box>
        </Box>
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
