import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useLocation} from 'react-router-dom';
import * as Yup from 'yup';
import {useFormik} from 'formik';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {SelectCombined} from 'components/SelectCombined';
import {BottomDrawer} from 'components/BottomDrawer';
import {FormLabel} from 'components/form/FormLabel';
import {FormInput} from 'components/form/FormInput';
import {SuppliersDataGrid} from 'components/DataGrid/SuppliersDataGrid';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {useFormatDate} from 'hooks/useFormatDate';
import {
  useArticleOrder,
  useCreateArticleOrder,
} from 'hooks/reactQuery/useArticle';
import {
  ArticleOrderItemRecord,
  ArticleOrderView,
  ArticleSupplierView,
  ArticleView,
  CreateArticleOrderRecord,
} from 'models/article';
import {pdf} from '@react-pdf/renderer';
import printJS from 'print-js';
import PathImage from 'assets/images/Path.svg';
import RemoveRedEye from '@mui/icons-material/RemoveRedEye';
import Edit from '@mui/icons-material/Edit';
import {Button} from 'components/Button';
import useTheme from '@mui/material/styles/useTheme';
import {useDownloadFileWithCustomName} from 'hooks/reactQuery/useDownloadUrl';
import {useCurrentCurrency} from 'utils/currency';
import useLogoDimensions from 'hooks/useLogoDimensions';
import useLogoImage from 'hooks/useLogoImage';
import {ArticleItemsTable} from './ArticleItemsTable';
import OrderArticlePDF from './OrderArticlePDF';
import OrderArticlePDFPreview from './OrderArticlePDFPreview';
import PdfPreview from './PDFPreview';

const validationSchema = Yup.object().shape({
  serviceCompanyId: Yup.string().required('Service company ID is required'),
  externalId: Yup.string(),
  articleSupplierId: Yup.string().required('Article supplier ID is required'),
  description: Yup.string().required('Description is required'),
  items: Yup.array()
    .of(
      Yup.object().shape({
        articleId: Yup.string().required('Article ID is required'),
        articleName: Yup.string().required('Article name is required'),
        supplierArticleNumber: Yup.string().required(
          'Supplier article number is required',
        ),
        quantity: Yup.number().required('Quantity is required'),
        unit: Yup.string().required('Unit is required'),
        description: Yup.string(),
      }),
    )
    .min(1)
    .required('Articles are required'),
});

const enum DocumentMode {
  EDIT = 'EDIT',
  PREVIEW = 'PREVIEW',
  PRINT = 'PRINT',
}

export const OrderArticle = () => {
  const {t} = useTranslation();
  const theme = useTheme();
  const location = useLocation();
  const articleFromLocation = (location.state as {article: ArticleView})
    ?.article;
  const formatDate = useFormatDate();
  const {user} = useUserSession();
  const currentCurrency = useCurrentCurrency();
  const [orderId, setOrderId] = useState('');
  const {data: articleOrder} = useArticleOrder(orderId);
  const {mutate: createArticleOrder, isLoading: isCreating} =
    useCreateArticleOrder(
      <Box display="flex" padding="0em" margin="0em" alignItems="center">
        <img alt={t('Path Image')} src={PathImage} />{' '}
        <Typography margin="0em" paddingLeft="0.5em" variant="body2">
          {t('PDF generation is in progress. Please wait...')}
        </Typography>
      </Box>,
    );
  const [supplier, setSupplier] = useState<ArticleSupplierView | undefined>(
    undefined,
  );
  const [items, setItems] = useState<ArticleOrderItemRecord[]>([]);
  const [newArticleOrder, setNewArticleOrder] = useState<
    ArticleOrderView | null | undefined
  >(null);

  const [mode, setMode] = useState(DocumentMode.EDIT);
  const [previewPdfBlobUrl, setPreviewPdfBlobUrl] = useState('');
  const [printPdfBlobUrl, setPrintPdfBlobUrl] = useState('');
  const imageUrl = useLogoImage(user);

  const {downloadFile} = useDownloadFileWithCustomName(
    `AO_${newArticleOrder?.externalId}`,
    printPdfBlobUrl,
  );

  const initialValues: CreateArticleOrderRecord = {
    serviceCompanyId: user?.userAccount.serviceCompany.id ?? '',
    externalId: '',
    articleSupplierId: '',
    description: '',
    items: [],
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: () => {},
  });

  const handleSelectSupplier = (row: ArticleSupplierView) => {
    setSupplier(row);
    formik.setFieldValue('articleSupplierId', row.id);
  };

  const logoDimensions = useLogoDimensions(imageUrl);

  const generatePrintBlobUrl = async () => {
    if (newArticleOrder) {
      const blob = await pdf(
        <OrderArticlePDF
          articleOrder={newArticleOrder!}
          userInfo={user?.userAccount}
          currencyCode={currentCurrency.code}
          logoSrc={imageUrl}
          logoDimensions={logoDimensions}
        />,
      ).toBlob();
      const blobURL = URL.createObjectURL(blob);
      setPrintPdfBlobUrl(blobURL);
    }
  };

  const handleSave = async () => {
    if (newArticleOrder && printPdfBlobUrl && mode !== DocumentMode.PRINT) {
      setMode(DocumentMode.PRINT);
      downloadFile();
    }
  };

  const handleCreateOrder = () => {
    createArticleOrder(formik.values, {
      onSuccess: async ({value}) => {
        setOrderId(value);
      },
    });
  };

  const handlePrint = async () => {
    generatePrintBlobUrl();
    if (printPdfBlobUrl) {
      printJS({
        printable: printPdfBlobUrl,
        type: 'pdf',
        showModal: true,
      });
    }
  };

  const handlePreview = async () => {
    setPrintPdfBlobUrl('');
    setMode(DocumentMode.PREVIEW);
    setNewArticleOrder(null);
    const blob = await pdf(
      <OrderArticlePDFPreview
        supplier={supplier!}
        formik={formik}
        userInfo={user?.userAccount}
        logoSrc={imageUrl}
        currencyCode={currentCurrency.code}
        logoDimensions={logoDimensions}
      />,
    ).toBlob();
    const blobURL = URL.createObjectURL(blob);
    setPreviewPdfBlobUrl(blobURL);
  };

  const handleEdit = () => {
    setMode(DocumentMode.EDIT);
    setNewArticleOrder(null);
    setPrintPdfBlobUrl('');
  };

  useEffect(() => {
    formik.setFieldValue('items', items);
  }, [items]);

  useEffect(() => {
    if (articleFromLocation) {
      const preferredSupplier = articleFromLocation?.suppliers.find(
        (s) => s.isPreferred,
      )?.supplier;

      if (preferredSupplier) {
        setSupplier(preferredSupplier);
        formik.setFieldValue('articleSupplierId', preferredSupplier.id);
      }

      if (!items.length) {
        setItems([
          {
            articleId: articleFromLocation.id,
            articleName: articleFromLocation.name,
            supplierArticleNumber:
              ((articleFromLocation?.suppliers?.length ?? 0) > 1
                ? articleFromLocation?.suppliers?.find((s) => s.isPreferred)
                    ?.number
                : articleFromLocation?.suppliers?.[0]?.number) ?? '-',
            quantity: 1,
            unit: articleFromLocation.unit,
            description: articleFromLocation.description,
            unitSellingAmount: articleFromLocation.unitSellingAmount,
          },
        ]);
      }
    }
  }, [articleFromLocation]);

  useEffect(() => {
    setNewArticleOrder(articleOrder);
  }, [articleOrder]);

  useEffect(() => {
    if (newArticleOrder && !printPdfBlobUrl) {
      generatePrintBlobUrl();
    }
  }, [newArticleOrder]);

  useEffect(() => {
    if (printPdfBlobUrl) {
      handleSave();
    }
  }, [printPdfBlobUrl]);

  return (
    <Box>
      <Box
        width="min(calc(1240px + 1.25em), 100%)"
        mx="auto"
        mb="8em"
        mt="1.5em">
        {mode === DocumentMode.EDIT ? (
          <Box bgcolor="white" p="1.5rem">
            <Typography variant="h6">{t('Order Article')}</Typography>
            <Box display="flex" mt="1rem" gap="2rem">
              <Box
                flexGrow={1}
                display="flex"
                flexDirection="column"
                gap="1rem">
                <Box>
                  <FormLabel text={t('From')} />
                  <Box
                    display="flex"
                    bgcolor="grey.200"
                    alignItems="start"
                    justifyContent="space-between"
                    px="0.75rem"
                    py=".5rem"
                    border="1px solid"
                    borderColor="inputBackground.main"
                    borderRadius="4px">
                    <Box>
                      <Typography variant="body2">
                        {user?.userAccount.serviceCompany.name || ''}
                      </Typography>
                      <Box color="text.secondary">
                        {user &&
                        'businessAddress' in user.userAccount.serviceCompany &&
                        user.userAccount.serviceCompany.postalAddress
                          ?.fullName ? (
                          <Typography variant="caption">
                            {
                              user.userAccount.serviceCompany.postalAddress
                                ?.fullName
                            }
                          </Typography>
                        ) : (
                          ''
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Box>
                <SelectCombined
                  selected={supplier !== undefined}
                  label="Supplier"
                  buttonText="Select Supplier"
                  cardHeader={
                    supplier && (
                      <Typography variant="body2">
                        {supplier.name || '-'}
                      </Typography>
                    )
                  }
                  cardBody={
                    supplier && (
                      <>
                        <Typography variant="caption">
                          {supplier.address?.fullName || '-'}
                        </Typography>
                        <Typography variant="caption" component="p">
                          {supplier.externalId || '-'}
                        </Typography>
                      </>
                    )
                  }
                  cardOnClose={() => setSupplier(undefined)}
                  modalHeader="Select Supplier"
                  modalBody={
                    <SuppliersDataGrid setRowItem={handleSelectSupplier} />
                  }
                  labelRequired
                />
              </Box>
              <Box
                width="40%"
                display="flex"
                flexDirection="column"
                gap="2em"
                mt="1.5em">
                <Box>
                  <FormLabel text="Date" />
                  <Typography>{formatDate(new Date())}</Typography>
                </Box>
              </Box>
            </Box>

            <Box display="flex" flexDirection="column" gap={3} pt="2rem">
              <FormInput
                props={{
                  name: 'externalId',
                  label: 'Purchase order number',
                  value: formik.values.externalId,
                  onChange: formik.handleChange,
                  onBlur: formik.handleBlur,
                  error:
                    !!formik.errors.externalId && formik.touched.externalId,
                  helperText:
                    formik.touched.externalId && formik.errors.externalId,
                }}
              />
              <FormInput
                props={{
                  name: 'description',
                  label: 'Description',
                  value: formik.values.description,
                  onChange: formik.handleChange,
                  onBlur: formik.handleBlur,
                  error:
                    !!formik.errors.description && formik.touched.description,
                  helperText:
                    formik.touched.description && formik.errors.description,
                  required: true,
                  multiline: true,
                  rows: 4,
                }}
              />
            </Box>

            <ArticleItemsTable items={items} setItems={setItems} />
          </Box>
        ) : mode === DocumentMode.PREVIEW ? (
          <Box
            sx={{margin: '0 auto', display: 'flex', justifyContent: 'center'}}>
            {previewPdfBlobUrl && <PdfPreview blobUrl={previewPdfBlobUrl} />}
          </Box>
        ) : (
          mode === DocumentMode.PRINT &&
          newArticleOrder && (
            <Box
              sx={{
                margin: '0 auto',
                display: 'flex',
                justifyContent: 'center',
              }}>
              {printPdfBlobUrl && <PdfPreview blobUrl={printPdfBlobUrl} />}
            </Box>
          )
        )}
      </Box>

      <BottomDrawer
        isOpen
        primaryButtonLabel={
          mode === DocumentMode.EDIT || mode === DocumentMode.PREVIEW
            ? t('Save')
            : mode === DocumentMode.PRINT && t('Print order')
        }
        primaryButtonAction={
          mode === DocumentMode.EDIT || mode === DocumentMode.PREVIEW
            ? handleCreateOrder
            : handlePrint
        }
        listItems={[]}
        isValid={formik.isValid}
        secondaryButton={
          <Button
            label={mode === DocumentMode.EDIT ? 'Preview' : 'Continue editing'}
            buttonProps={{
              variant: 'outlined',
              sx: {bgcolor: theme.palette.inputBackground.main},
              startIcon:
                mode === DocumentMode.EDIT ? <RemoveRedEye /> : <Edit />,
              size: 'medium',
              disabled: !formik.isValid || isCreating,
              onClick: mode === DocumentMode.EDIT ? handlePreview : handleEdit,
            }}
          />
        }
      />
    </Box>
  );
};

export default OrderArticle;
