import {useEffect, useMemo, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {UseTranslationOptions, useTranslation} from 'react-i18next';
import * as Yup from 'yup';
import {useFormik} from 'formik';
import useTheme from '@mui/material/styles/useTheme';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import Cancel from '@mui/icons-material/Cancel';
import Print from '@mui/icons-material/Print';
import RemoveRedEye from '@mui/icons-material/RemoveRedEye';
import Edit from '@mui/icons-material/Edit';
import {PageCard} from 'components/PageCard';
import {FormLabel} from 'components/form/FormLabel';
import {FormInput} from 'components/form/FormInput';
import {BottomDrawer} from 'components/BottomDrawer';
import {Button} from 'components/Button';
import {Progress} from 'components/Progress';
import {SendEmailDialog} from 'components/SendEmailDialog';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {
  useCreateInvoiceOverdueNotice,
  useInvoiceDetail,
} from 'hooks/reactQuery/useInvoice';
// import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {
  currencyFactor,
  formatCurrency,
  formatGrossAmount,
  getCurrencySymbol,
  useCurrentCurrency,
} from 'utils/currency';
import {formatDate} from 'utils/datetime';
import {pdf} from '@react-pdf/renderer';
import PdfPreview from 'pages/OrderArticle/PDFPreview';
import {useCompanyById} from 'hooks/reactQuery/useCompanies';
import {
  companyLanguageContextMap,
  createFilesFromBlobArray,
  dateToString,
} from 'utils/utils';
import printJS from 'print-js';
import {useUuid} from 'hooks/reactQuery/useUuid';
import {FileWithPreview} from 'components/MyDropZone/MyDropzone';
import {useUploadFiles} from 'hooks/reactQuery/useUploadSignedUrl';
import {SimpleEmailRecord} from 'models/misc';
import {CreateInvoiceOverdueNoticeRecord} from 'models/invoice';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {useQueryClientStorageData} from 'hooks/useClientStorage';
import InvoiceOverduePdfPreview from './InvoiceOverduePdfPreview';

const validationSchema = Yup.object().shape({
  customerAddress: Yup.string().required('Customer Address is required'),
  invoiceNumber: Yup.string().required('Invoice number is required'),
  subject: Yup.string().required('Subject is required'),
  description: Yup.string().required('Description is required'),
  initialAmount: Yup.number().required('Initial amount is required'),
  handlingFee: Yup.number().required('Handling fee is required'),
});

type CustomTranslationOptions = UseTranslationOptions<'translation'> & {
  lng?: string;
};

export const InvoiceOverdueNotice = () => {
  const {t} = useTranslation();
  const theme = useTheme();
  const {user} = useUserSession();
  const navigate = useNavigate();
  const {id: invoiceId} = useParams();
  const {data: uuid} = useUuid();
  const overdueNoticeId = uuid;
  const [isSendEmailDialogOpen, setIsSendEmailDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const {data: invoice, isLoading} = useInvoiceDetail(invoiceId);
  const {mutateAsync: createInvoiceOverdueNotice} =
    useCreateInvoiceOverdueNotice();

  const {mutateAsync: uploadFiles, isLoading: isUploadLoading} = useUploadFiles(
    'The document was sent successfully.',
  );

  const currentCurrency = useCurrentCurrency();
  const [previewPdfBlobUrl, setPreviewPdfBlobUrl] = useState('');
  const [blobFile, setBlobFile] = useState<Blob>();

  const {data: company} = useCompanyById(user?.userAccount.serviceCompany.id);
  const {t: translateCompanyLanguage} = useTranslation('translation', {
    lng: companyLanguageContextMap[company?.language as string],
  } as CustomTranslationOptions);

  const translate = useMemo(
    () => (key: string) => {
      if (company?.language) {
        return translateCompanyLanguage(key);
      }

      return t(key);
    },
    [company?.language],
  );

  const {data: clientStorageData} = useQueryClientStorageData({
    serviceCompanyId: company?.id!,
    params: {key: 'pdf-template'},
  });

  const headerInfo = JSON.parse(clientStorageData?.value || '{}').header;
  const footerInfo = JSON.parse(clientStorageData?.value || '{}').footer;

  const {data: headerUrl = {}} = useDownloadUrl(
    headerInfo?.path ? [headerInfo.path] : [],
    undefined,
    company?.id,
  );

  const {data: footerUrl = {}} = useDownloadUrl(
    footerInfo?.path ? [footerInfo.path] : [],
    undefined,
    company?.id,
  );

  const initialValues = {
    customerAddress: invoice?.propertyOwner?.billingAddress?.fullName ?? '',
    invoiceNumber: invoice?.externalId ?? '',
    subject: t('Overdue notice for invoice {{invoiceNumber}}', {
      invoiceNumber: invoice?.externalId ?? '',
    }),
    description: t(
      "Hello {{customerName}},\n\nYour payment for Invoice #{{invoiceNumber}}, was due on {{dueDate}}, is overdue.\nAmount Due: {{amountDue}}\n\nIf you've paid, please let us know. If not, please do so soon to avoid extra fees.\n\nQuestions? Contact us at {{contactEmail}}.\nThanks, {{companyName}}",
      {
        customerName: invoice?.serviceOrder?.elevator.propertyOwner.name ?? '',
        invoiceNumber: invoice?.externalId ?? '',
        dueDate: formatDate(invoice?.dueDate ?? ''),
        amountDue: formatGrossAmount(invoice?.totalAmount),
        contactEmail: user?.userAccount.serviceCompany.contact.email ?? '',
        companyName: user?.userAccount.serviceCompany.name ?? '',
      },
    ),
    initialAmount:
      (invoice?.totalAmount.grossAmount ?? 0) /
      10 ** (invoice?.totalAmount.fractionDigits ?? 0),
    handlingFee: 0,
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnMount: false,
    enableReinitialize: true,
    onSubmit: () => {},
  });

  const sendEmailDescription = t(
    'Hello,\n\nWe hope this message finds you well. Please find attached the invoice for the services we provided in [Month].\n\nInvoice Details:\n- Invoice Number: {{invoiceNumber}}\n- Due Date: {{dueDate}}\n- Amount: {{amountDue}}\n\nPlease process the payment by the due date to ensure uninterrupted service.\n\nFor any questions or clarifications, feel free to reach out to our accounts department.\n\nKind regards,\n{{companyName}}',
    {
      invoiceNumber: invoice?.externalId ?? '',
      dueDate: formatDate(invoice?.dueDate ?? ''),
      amountDue: formatGrossAmount(invoice?.totalAmount),
      companyName: user?.userAccount.serviceCompany.name ?? '',
    },
  );

  const factor = currencyFactor({
    currency: invoice?.totalAmount.currency ?? '',
  });

  const handlePreview = async () => {
    const blob = await pdf(
      <InvoiceOverduePdfPreview
        userInfo={user?.userAccount}
        currentCurrency={currentCurrency}
        translate={translate}
        invoice={invoice}
        formik={formik}
        selectedLng={company?.language}
        headerPath={headerUrl[headerInfo?.path]}
        headerInfo={headerInfo}
        footerPath={footerUrl[footerInfo?.path]}
        footerInfo={footerInfo}
      />,
    ).toBlob();
    setBlobFile(blob);
    const blobURL = URL.createObjectURL(blob);
    setPreviewPdfBlobUrl(blobURL);
  };

  const handlePreviewInvoiceOverdueNotice = () => {
    if (isEditing) {
      setIsEditing(false);
      handlePreview();
    } else {
      setIsEditing(true);
    }
  };

  const onSubmitHandler = async (values: SimpleEmailRecord) => {
    const serviceCompanyId = user?.userAccount.serviceCompany.id;
    const uploadPath = `${serviceCompanyId}/invoices/${invoice?.id}/overdueNotices/`;

    const fileNames: string[] = [`${overdueNoticeId}.pdf`];

    const files = await createFilesFromBlobArray([blobFile!], fileNames);

    await uploadFiles({files, uploadPath});

    const createInvoiceOverdueNoticeBody: CreateInvoiceOverdueNoticeRecord = {
      externalId: formik.values.invoiceNumber,
      subject: formik.values.subject,
      description: formik.values.description,
      dueDate: invoice?.dueDate ?? '',
      initialAmount: {
        value: Math.round(formik.values.initialAmount * factor),
        currency: invoice?.totalAmount.currency ?? '',
      },
      handlingFee: {
        value: Math.round(formik.values.handlingFee * factor),
        currency: invoice?.totalAmount.currency ?? '',
      },
      sentDate: dateToString(new Date()),
      emailRecord: {
        email: '',
        emails: [values.email] || [],
        subject: values.subject,
        content: values.content || sendEmailDescription,
        attachments: files.reduce<FileWithPreview[]>(
          (newArr: FileWithPreview[], obj) => [
            ...newArr,
            {
              ...obj,
              type: obj.type,
              uri: `${uploadPath}/${obj.name}`,
              description: obj.name.split('.')[0],
            },
          ],
          [],
        ),
      },
    };

    createInvoiceOverdueNotice({
      invoiceId: invoice?.id ?? '',
      body: createInvoiceOverdueNoticeBody,
    });

    navigate(`/invoices/details/${invoice?.id}`, {replace: true});
  };

  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = async () => {
    setIsPrinting(true);
  };

  useEffect(() => {
    handlePreview();
  }, [invoice]);

  useEffect(() => {
    if (isPrinting && previewPdfBlobUrl) {
      printJS({
        printable: previewPdfBlobUrl,
        type: 'pdf',
        showModal: true,
        onPrintDialogClose: () => {
          setIsPrinting(false);
        },
      });
      setIsPrinting(false);
    }
    handlePreview();
  }, [isPrinting]);

  const actions = useMemo(() => {
    const items = [
      {
        label: t('Cancel'),
        icon: <Cancel />,
        onClick: () => navigate(-1),
      },
    ];
    items.unshift({
      label: t('Print'),
      icon: <Print />,
      onClick: () => {
        handlePrint();
      },
    });
    return items;
  }, []);

  if (isLoading) {
    return <Progress />;
  }

  return (
    <>
      {isEditing ? (
        <>
          <PageCard
            containerStyles={{
              mb: '1rem',
              mt: '1.5rem',
              width: '100%',
              maxWidth: '50rem',
              alignSelf: 'center',
            }}
            contentContainerStyles={{display: 'flex', gap: '3.7rem'}}>
            <Box>
              <FormLabel text="Invoice Number" sx={{color: 'text.main'}} />
              <Typography variant="subtitle1">{invoice?.externalId}</Typography>
            </Box>

            <Box>
              <FormLabel
                text="Total"
                sx={{color: 'text.main', textTransform: 'initial'}}
              />
              <Typography variant="subtitle1">
                {formatGrossAmount(invoice?.totalAmount)}
              </Typography>
            </Box>
          </PageCard>
          <PageCard
            containerStyles={{
              mb: '5rem',
              width: '100%',
              maxWidth: '50rem',
              alignSelf: 'center',
            }}
            contentContainerStyles={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}>
            <Typography variant="h6">{t('Overdue Notice')}</Typography>
            <Box>
              <FormLabel text={t('From')} />
              <Box
                display="flex"
                bgcolor="grey.200"
                alignItems="start"
                justifyContent="space-between"
                mt="0.5rem"
                px="0.75rem"
                py=".5rem"
                border="1px solid"
                borderColor="inputBackground.main"
                borderRadius="4px">
                <Box>
                  <Typography variant="h6">
                    {user?.userAccount.serviceCompany.name || ''}
                  </Typography>
                  <Box>
                    {user &&
                    'businessAddress' in user.userAccount.serviceCompany &&
                    user.userAccount.serviceCompany.billingAddress?.fullName ? (
                      <Typography variant="caption">
                        {
                          user.userAccount.serviceCompany.billingAddress
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
            <FormInput
              props={{
                name: 'customerAddress',
                label: t('Customer Address'),
                placeholder: t(
                  'e.g. 2118 Thornridge Cir. Syracuse, Connecticut 35624',
                ),
                variant: 'outlined',
                value: formik.values.customerAddress,
                error: !!(
                  formik.touched.customerAddress &&
                  formik.errors.customerAddress
                ),
                onBlur: formik.handleBlur,
                onChange: formik.handleChange,
                required: true,
              }}
            />
            <FormInput
              props={{
                name: 'invoiceNumber',
                label: t('Invoice Number'),
                variant: 'outlined',
                value: formik.values.invoiceNumber,
                error: !!(
                  formik.touched.invoiceNumber && formik.errors.invoiceNumber
                ),
                onBlur: formik.handleBlur,
                onChange: formik.handleChange,
                required: true,
              }}
            />
            <FormInput
              props={{
                name: 'subject',
                label: t('Subject'),
                placeholder: t('e.g. Late payment'),
                variant: 'outlined',
                value: formik.values.subject,
                error: !!(formik.touched.subject && formik.errors.subject),
                onBlur: formik.handleBlur,
                onChange: formik.handleChange,
                required: true,
              }}
            />
            <FormInput
              props={{
                name: 'description',
                label: t('Description'),
                placeholder: t(
                  'e.g. The invoice is overdue [XX] days. Hearby we remind you to please pay the outstanding amount.',
                ),
                variant: 'outlined',
                value: formik.values.description,
                error: !!(
                  formik.touched.description && formik.errors.description
                ),
                onBlur: formik.handleBlur,
                onChange: formik.handleChange,
                required: true,
                multiline: true,
                rows: 10,
              }}
            />

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center">
              <Typography flex={1} variant="body2">
                {t('Initial amount')}
              </Typography>
              <FormInput
                fullWidth={false}
                onValueChange={(values) => {
                  formik.setFieldValue(values.name as string, values.value);
                }}
                inputType="currency"
                props={{
                  name: 'initialAmount',
                  size: 'small',
                  value: formik.values.initialAmount,
                  onBlur: formik.handleBlur,
                  error: !!(
                    formik.touched.initialAmount && formik.errors.initialAmount
                  ),

                  sx: {width: '120px'},
                  InputProps: {
                    inputProps: {
                      min: 0,
                    },
                    startAdornment: (
                      <InputAdornment position="start">
                        {
                          getCurrencySymbol[
                            invoice?.totalAmount.currency ?? 'EUR'
                          ]
                        }
                      </InputAdornment>
                    ),
                  },
                  required: true,
                }}
              />
            </Box>

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center">
              <Typography variant="body2">{t('Handling fee')}</Typography>
              <FormInput
                fullWidth={false}
                onValueChange={(values) => {
                  formik.setFieldValue(values.name as string, values.value);
                }}
                inputType="currency"
                props={{
                  name: 'handlingFee',
                  size: 'small',
                  value: formik.values.handlingFee,
                  onBlur: formik.handleBlur,
                  error: !!(
                    formik.touched.handlingFee && formik.errors.handlingFee
                  ),
                  sx: {width: '120px'},
                  InputProps: {
                    inputProps: {
                      min: 0,
                    },
                    startAdornment: (
                      <InputAdornment position="start">
                        {
                          getCurrencySymbol[
                            invoice?.totalAmount.currency ?? 'EUR'
                          ]
                        }
                      </InputAdornment>
                    ),
                  },
                  required: true,
                }}
              />
            </Box>

            <Box
              bgcolor="grey.700"
              borderRadius="4px"
              p="0.75rem"
              display="flex"
              justifyContent="space-between">
              <Typography sx={{color: 'primary.contrastText'}}>
                {t('Total Amount')}
                <Typography variant="caption" component="span" ml="1ch">
                  {t('(incl VAT)')}
                </Typography>
              </Typography>
              <Typography sx={{color: 'primary.contrastText'}}>
                {formatCurrency(
                  formik.values.initialAmount + formik.values.handlingFee,
                  {currency: invoice?.totalAmount.currency ?? 'EUR'},
                )}
              </Typography>
            </Box>
          </PageCard>
        </>
      ) : (
        <Box
          sx={{
            margin: '1em auto 5em auto',
            display: 'flex',
            justifyContent: 'center',
          }}>
          {previewPdfBlobUrl && <PdfPreview blobUrl={previewPdfBlobUrl} />}
        </Box>
      )}

      <BottomDrawer
        isOpen
        primaryButtonLabel={t('Send')}
        primaryButtonAction={() => setIsSendEmailDialogOpen(true)}
        listItems={actions.map((item) => ({
          ...item,
          showBorder: actions[actions.length - 1] !== item,
        }))}
        isValid={formik.isValid || formik.isSubmitting}
        secondaryButton={
          <Button
            label={isEditing ? 'Preview' : 'Continue editing'}
            buttonProps={{
              variant: 'outlined',
              sx: {bgcolor: theme.palette.inputBackground.main},
              startIcon: isEditing ? <RemoveRedEye /> : <Edit />,
              size: 'medium',
              onClick: () => handlePreviewInvoiceOverdueNotice(),
            }}
          />
        }
      />

      <SendEmailDialog
        open={isSendEmailDialogOpen}
        onConfirm={() => setIsSendEmailDialogOpen(false)}
        onClose={() => setIsSendEmailDialogOpen(false)}
        id={invoice?.id ?? ''}
        confirmBtnDisabled={isUploadLoading}
        email={
          invoice?.propertyOwner?.additionalInfo.billingEmail ||
          invoice?.propertyOwner?.contact.email
        }
        subject={formik.values.subject}
        content={formik.values.description || sendEmailDescription}
        callback={(values) => onSubmitHandler(values)}
        loadingProgress={isEditing ? 1 : 0}
      />
    </>
  );
};

export default InvoiceOverdueNotice;
