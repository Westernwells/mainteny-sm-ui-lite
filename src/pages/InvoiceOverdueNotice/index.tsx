import {useMemo, useState} from 'react';
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
import {PageCard} from 'components/PageCard';
import {FormLabel} from 'components/form/FormLabel';
import {FormInput} from 'components/form/FormInput';
import {BottomDrawer} from 'components/BottomDrawer';
import {Button} from 'components/Button';
import {Progress} from 'components/Progress';
import {SendEmailDialog} from 'components/SendEmailDialog/index';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {
  useCreateInvoiceOverdueNotice,
  useInvoiceDetail,
} from 'hooks/reactQuery/useInvoice';
import {
  centsToMoney,
  currencyFactor,
  formatCurrency,
  formatGrossAmount,
  getCurrencySymbol,
  useCurrentCurrency,
} from 'utils/currency';
import {formatDate} from 'utils/datetime';
import {pdf} from '@react-pdf/renderer';
import {useCompanyById} from 'hooks/reactQuery/useCompanies';
import {createFilesFromBlobArray, dateToString} from 'utils/utils';
import printJS from 'print-js';
import {useUuid} from 'hooks/reactQuery/useUuid';
import {FileWithPreview} from 'components/MyDropZone/MyDropzone';
import {useUploadFiles} from 'hooks/reactQuery/useUploadSignedUrl';
import {EmailRecord} from 'models/misc';
import {CreateInvoiceOverdueNoticeRecord} from 'models/invoice';
import {
  useDownloadFileWithCustomName,
  useDownloadUrl,
} from 'hooks/reactQuery/useDownloadUrl';
import {useQueryClientStorageData} from 'hooks/useClientStorage';
import {
  CLIENT_STORAGE_PDF_CONFIG_KEY,
  DEFAULT_CLIENT_STORAGE_PDF_CONFIG_STATE,
} from 'utils/constants';
import {companyLanguageContextMap} from 'utils/language';
import RichTextField from 'components/RichTextField';
import DialogPdfPreview from 'components/pdf-templates/DialogPdfPreview';
import {Dialog} from 'components/Dialog';
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
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
  const [isSendEmailDialogOpen, setIsSendEmailDialogOpen] = useState(false);
  const {data: invoice, isLoading} = useInvoiceDetail(invoiceId);
  const {mutateAsync: createInvoiceOverdueNotice} =
    useCreateInvoiceOverdueNotice();

  const {mutateAsync: uploadFiles, isLoading: isUploadLoading} = useUploadFiles(
    'The document was sent successfully.',
  );

  const currentCurrency = useCurrentCurrency();

  const [existingFiles, setExistingFiles] = useState<FileWithPreview[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [previewOverdueBlobUrl, setPreviewOverdueBlobUrl] = useState('');

  const {downloadFile} = useDownloadFileWithCustomName(
    `OV_INV_${invoice?.externalId}.pdf`,
    previewOverdueBlobUrl,
  );

  const {data: company, isLoading: isLoadingCompany} = useCompanyById(
    user?.userAccount.serviceCompany.id,
  );
  const {t: translateCompanyLanguage} = useTranslation('translation', {
    lng: companyLanguageContextMap[company?.language as string],
  } as CustomTranslationOptions);

  const translate = useMemo(
    () => (key: string, options?: {context: string}) => {
      if (company?.language) {
        return translateCompanyLanguage(key, options);
      }

      return t(key, options);
    },
    [company?.language],
  );

  const {data: invoiceDownloadUrl} = useDownloadUrl(
    invoice?.additionalInfo?.pdfPath ? [invoice.additionalInfo.pdfPath] : [],
    undefined,
    company?.id,
  );

  const {data: clientStorageData, isLoading: isLoadingClientStorageData} =
    useQueryClientStorageData({
      serviceCompanyId: company?.id!,
      params: {key: 'pdf-template'},
    });

  const headerInfo = JSON.parse(clientStorageData?.value || '{}').header;
  const footerInfo = JSON.parse(clientStorageData?.value || '{}').footer;

  const {data: headerUrl = {}, isLoading: isLoadingHeaderUrl} = useDownloadUrl(
    headerInfo?.path ? [headerInfo.path] : [],
    undefined,
    company?.id,
  );

  const {data: footerUrl = {}, isLoading: isLoadingFooterUrl} = useDownloadUrl(
    footerInfo?.path ? [footerInfo.path] : [],
    undefined,
    company?.id,
  );

  const {
    data: clientStorageDataPdfConfig,
    isLoading: isLoadingClientStorageDataPdfConfig,
  } = useQueryClientStorageData({
    serviceCompanyId: company?.id!,
    params: {key: CLIENT_STORAGE_PDF_CONFIG_KEY},
  });
  const pdfConfig = useMemo(
    () =>
      clientStorageDataPdfConfig?.value
        ? JSON.parse(clientStorageDataPdfConfig.value)
        : DEFAULT_CLIENT_STORAGE_PDF_CONFIG_STATE,
    [clientStorageDataPdfConfig],
  );

  const overdueNoticeDescription = useMemo(() => {
    if (!invoice || !user) return '';

    const paragraphs = [
      t('Hello {{customerName}},', {
        customerName: invoice?.serviceOrder?.elevator.propertyOwner.name ?? '',
      }),
      t(
        'Your payment for Invoice #{{invoiceNumber}}, was due on {{dueDate}}, is overdue.',
        {
          invoiceNumber: invoice?.externalId ?? '',
          dueDate: formatDate(invoice?.dueDate ?? ''),
        },
      ),
      t('Amount Due: {{amountDue}}', {
        amountDue: formatGrossAmount(invoice?.totalAmount),
      }),
      t(
        "If you've paid, please let us know. If not, please do so soon to avoid extra fees.",
        {},
      ),
      t('Questions? Contact us at {{contactEmail}}', {
        contactEmail: user?.userAccount.serviceCompany.contact.email ?? '',
      }),
      t('Thanks, {{companyName}}', {
        companyName: user?.userAccount.serviceCompany.name ?? '',
      }),
    ];

    return paragraphs.map((line) => `<p>${line}</p>`).join('<p></p>');
  }, [invoice, user, t]);

  const initialValues = {
    customerAddress: invoice?.propertyOwner?.billingAddress?.fullName ?? '',
    invoiceNumber: invoice?.externalId ?? '',
    subject: t('Overdue notice for invoice {{invoiceNumber}}', {
      invoiceNumber: invoice?.externalId ?? '',
    }),
    description: overdueNoticeDescription,
    initialAmount: centsToMoney(
      currentCurrency.code,
      invoice?.totalAmount.grossAmount,
    ),
    handlingFee: 0,
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnMount: false,
    enableReinitialize: true,
    onSubmit: () => {},
  });

  const factor = currencyFactor({
    currency: invoice?.totalAmount.currency ?? '',
  });

  const handlePreviewClose = () => {
    setOpenPreviewDialog(false);
    setPreviewOverdueBlobUrl('');
  };

  const generateOverduePdfBlob = async () =>
    pdf(
      <InvoiceOverduePdfPreview
        pdfConfigClientStorage={pdfConfig}
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
  const handlePreviewInvoiceOverdueNotice = async () => {
    const blob = await generateOverduePdfBlob();
    const blobURL = URL.createObjectURL(blob);
    setPreviewOverdueBlobUrl(blobURL);
    setOpenPreviewDialog(true);
  };

  const prepareAttachments = async () => {
    setIsLoadingFiles(true);

    try {
      const attachments: FileWithPreview[] = [];

      const overdueBlob = await generateOverduePdfBlob();
      const overdueFiles = await createFilesFromBlobArray(
        [overdueBlob],
        [`${overdueNoticeId}.pdf`],
        [`OV_INV_${invoice?.externalId}.pdf`],
      );
      attachments.push(...overdueFiles);

      if (invoice?.additionalInfo?.pdfPath && invoiceDownloadUrl) {
        const invoiceUrl = invoiceDownloadUrl[invoice.additionalInfo.pdfPath];
        const response = await fetch(invoiceUrl);
        const invoiceBlob = await response.blob();
        const invoiceFiles = await createFilesFromBlobArray(
          [invoiceBlob],
          [`${invoice?.id}.pdf`],
          [`${invoice.externalId}.pdf`],
        );
        attachments.push(...invoiceFiles);
      }

      setExistingFiles(attachments);
    } catch (error) {
      console.error('Error preparing attachments:', error);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleSendEmail = async () => {
    setIsSendEmailDialogOpen(true);
    await prepareAttachments();
  };

  const onSubmitHandler = async (values: EmailRecord) => {
    const serviceCompanyId = user?.userAccount.serviceCompany.id;
    const uploadPath = `${serviceCompanyId}/invoices/${invoice?.id}/overdueNotices`;
    const fileNames: string[] = [`${overdueNoticeId}.pdf`];

    const overdueBlob = await generateOverduePdfBlob();
    const overdueFiles = await createFilesFromBlobArray(
      [overdueBlob],
      fileNames,
      [`OV_INV_${invoice?.externalId}.pdf`],
    );

    let invoiceAttachment: FileWithPreview | null = null;

    if (invoice?.additionalInfo?.pdfPath) {
      const response = await fetch(
        invoiceDownloadUrl![invoice.additionalInfo.pdfPath],
      );
      const blob = await response.blob();

      invoiceAttachment = new File([blob], `${invoice?.externalId}.pdf`, {
        type: 'application/pdf',
      }) as FileWithPreview;

      invoiceAttachment.preview = URL.createObjectURL(blob);
      invoiceAttachment.uri = invoice.additionalInfo.pdfPath;
      invoiceAttachment.description = `${invoice?.externalId}.pdf`;
    }

    const allFiles = invoiceAttachment
      ? [...overdueFiles, invoiceAttachment]
      : overdueFiles;

    // Upload only the overdue notice file(s) since the invoice file is already hosted
    await uploadFiles({files: overdueFiles, uploadPath});

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
        emails: values.emails,
        ccEmails: values.ccEmails,
        bccEmails: values.bccEmails,
        subject: values.subject,
        content: values.content,
        attachments: allFiles.map((file) => ({
          ...file,
          type: file.type,
          uri: file.uri || `${uploadPath}/${file.name}`,
          description: file.description || file.name,
        })),
      },
    };

    await createInvoiceOverdueNotice({
      invoiceId: invoice?.id ?? '',
      body: createInvoiceOverdueNoticeBody,
    });
    navigate(`/invoices/details/${invoice?.id}`, {replace: true});
  };

  const handlePrint = async () => {
    const blob = await generateOverduePdfBlob();
    const blobURL = URL.createObjectURL(blob);

    printJS({
      printable: blobURL,
      type: 'pdf',
      showModal: true,
      onPrintDialogClose: () => {
        URL.revokeObjectURL(blobURL);
        setPreviewOverdueBlobUrl('');
      },
    });
  };

  const actions = [
    {
      label: t('Cancel'),
      icon: <Cancel />,
      onClick: () => navigate(-1),
    },
    {
      label: t('Print'),
      icon: <Print />,
      onClick: handlePrint,
    },
  ];

  if (
    isLoading ||
    isLoadingClientStorageDataPdfConfig ||
    !user ||
    isLoadingCompany ||
    isLoadingClientStorageData ||
    isLoadingHeaderUrl ||
    isLoadingFooterUrl
  ) {
    return <Progress />;
  }

  return (
    <>
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
                      {user.userAccount.serviceCompany.billingAddress?.fullName}
                    </Typography>
                  ) : (
                    ''
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
          <FormInput
            fieldProps={{
              name: 'customerAddress',
              label: t('Customer Address'),
              placeholder: t(
                'e.g. 2118 Thornridge Cir. Syracuse, Connecticut 35624',
              ),
              variant: 'outlined',
              value: formik.values.customerAddress,
              error: !!(
                formik.touched.customerAddress && formik.errors.customerAddress
              ),
              onBlur: formik.handleBlur,
              onChange: formik.handleChange,
              required: true,
            }}
          />
          <FormInput
            fieldProps={{
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
            fieldProps={{
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

          <RichTextField
            name="description"
            label={t('Description')}
            html={formik.values.description || ''}
            updateHtml={(h) => formik.setFieldValue('description', h)}
            minRows={10}
            onBlur={formik.handleBlur}
            required
            error={!!(formik.touched.description && formik.errors.description)}
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
              fieldProps={{
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
              fieldProps={{
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
      <Dialog
        title={t('Invoice Overdue preview')}
        onClose={handlePreviewClose}
        onCancel={() => downloadFile()}
        dialogProps={{
          open: openPreviewDialog || false,
        }}
        sx={{
          '& .MuiDialog-paper': {
            width: '750px',
            maxWidth: 'none',
            maxHeight: '844px',
          },
        }}
        leftButton={
          <Button
            label="Close"
            buttonProps={{
              onClick: handlePreviewClose,
              variant: 'text',
              size: 'medium',
              sx: {background: 'white'},
            }}
          />
        }
        cancelButtonText={t('Download')}
        cancelButtonVariant="outlined"
        cancelButtonStyles={{marginRight: '1em', border: '1px solid #000034'}}
        cancelButtonTextColor="text.primary"
        saveButtonText={t('Continue editing')}
        onSave={handlePreviewClose}
        showSaveButton
        showCancelButton>
        <DialogPdfPreview filePathToDownload={previewOverdueBlobUrl} />
      </Dialog>

      <BottomDrawer
        isOpen
        primaryButtonLabel={t('Send')}
        primaryButtonAction={handleSendEmail}
        listItems={actions.map((item) => ({
          ...item,
          showBorder: actions[actions.length - 1] !== item,
        }))}
        isValid={formik.isValid || formik.isSubmitting}
        isSaving={isLoadingFiles || isUploadLoading}
        secondaryButton={
          <Button
            label="Preview"
            buttonProps={{
              variant: 'outlined',
              sx: {bgcolor: theme.palette.inputBackground.main},
              startIcon: <RemoveRedEye />,
              size: 'medium',
              onClick: () => handlePreviewInvoiceOverdueNotice(),
            }}
          />
        }
      />

      <SendEmailDialog
        open={isSendEmailDialogOpen}
        onConfirm={() => {
          setIsSendEmailDialogOpen(false);
          setExistingFiles([]);
        }}
        onClose={() => {
          setIsSendEmailDialogOpen(false);
          setExistingFiles([]);
        }}
        id={invoice?.id ?? ''}
        confirmBtnDisabled={isUploadLoading}
        email={
          invoice?.propertyOwner?.additionalInfo.billingEmail ||
          invoice?.propertyOwner?.contact.email
        }
        subject={formik.values.subject}
        content={formik.values.description}
        callback={(values) => onSubmitHandler(values)}
        existingFiles={existingFiles}
        isLoadingFiles={isLoadingFiles}
      />
    </>
  );
};

export default InvoiceOverdueNotice;
