import {useMemo, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import * as Yup from 'yup';
import {useFormik} from 'formik';
import useTheme from '@mui/material/styles/useTheme';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
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
import Delayed from 'components/Delayed';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {
  useCreateInvoiceOverdueNotice,
  useInvoiceDetail,
  usePublishInvoiceOverdueNotice,
} from 'hooks/reactQuery/useInvoice';
import useFakeProgress from 'hooks/useFakeProgress';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {formatCurrency, getCurrencySymbol} from 'utils/currency';
import {SimpleEmailRecord} from 'models/misc';
import {PDFPreview} from './Preview';

const validationSchema = Yup.object().shape({
  customerAddress: Yup.string().required('Customer Address is required'),
  invoiceNumber: Yup.string().required('Invoice number is required'),
  subject: Yup.string().required('Subject is required'),
  description: Yup.string().required('Description is required'),
  initialAmount: Yup.number().required('Initial amount is required'),
  handlingFee: Yup.number().required('Handling fee is required'),
});

export const InvoiceOverdueNotice = () => {
  const {t} = useTranslation();
  const theme = useTheme();
  const {user} = useUserSession();
  const navigate = useNavigate();
  const {id: invoiceId} = useParams();
  const [isSendEmailDialogOpen, setIsSendEmailDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const {data: invoice, isLoading} = useInvoiceDetail(invoiceId);
  const createInvoiceOverdueNotice = useCreateInvoiceOverdueNotice();
  const publishInvoiceOverdueNotice = usePublishInvoiceOverdueNotice();
  const fakeProgress = useFakeProgress(createInvoiceOverdueNotice.status);
  const overdueNotice = invoice?.overdueNotices.find(
    (i) => i.id === createInvoiceOverdueNotice.data?.value,
  );
  const {data: downloadUrl} = useDownloadUrl(
    overdueNotice?.additionalInfo.pdfPath
      ? [overdueNotice?.additionalInfo.pdfPath]
      : [],
  );

  const initialValues = {
    customerAddress: invoice?.serviceOrder?.elevator.address.fullName ?? '',
    invoiceNumber: invoice?.externalId ?? '',
    subject: invoice?.subject ?? '',
    description: invoice?.description ?? '',
    initialAmount:
      (invoice?.totalAmount.netAmount ?? 0) /
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

  const createInvoiceOverdueNoticeBody = {
    invoiceId: invoice?.id ?? '',
    body: {
      externalId: formik.values.invoiceNumber,
      subject: formik.values.subject,
      description: formik.values.description,
      dueDate: invoice?.dueDate ?? '',
      initialAmount: {
        value: formik.values.initialAmount,
        currency: invoice?.totalAmount.currency ?? '',
      },
      handlingFee: {
        value: formik.values.handlingFee,
        currency: invoice?.totalAmount.currency ?? '',
      },
    },
  };

  const handlePreviewInvoiceOverdueNotice = () => {
    if (isEditing) {
      createInvoiceOverdueNotice.mutate(createInvoiceOverdueNoticeBody, {
        onSettled: () => setIsEditing(false),
      });
    } else {
      setIsEditing(true);
    }
  };

  const onSubmitHandler = (sendEmailBody: SimpleEmailRecord) => {
    formik.setSubmitting(true);

    const noticeId = createInvoiceOverdueNotice.data?.value;

    if (noticeId) {
      return publishInvoiceOverdueNotice.mutate(
        {
          invoiceId: invoice?.id ?? '',
          noticeId,
          body: sendEmailBody,
        },
        {onSettled: () => formik.setSubmitting(false)},
      );
    }

    createInvoiceOverdueNotice.mutate(createInvoiceOverdueNoticeBody, {
      onSuccess: ({value}) => {
        publishInvoiceOverdueNotice.mutate({
          invoiceId: invoice?.id ?? '',
          noticeId: value,
          body: sendEmailBody,
        });
      },
      onSettled: () => formik.setSubmitting(false),
    });
  };

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
      // TODO: handle print
      onClick: () => console.log('print....'),
    });
    return items;
  }, []);

  if (isLoading) {
    return <Progress />;
  }

  return (
    <>
      {isEditing ? (
        <PageCard
          containerStyles={{
            mb: '5rem',
            mt: '1.5rem',
            width: '100%',
            maxWidth: '50rem',
            alignSelf: 'center',
          }}
          contentContainerStyles={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}>
          <Typography variant="h6">Overdue notice</Typography>
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
                  user.userAccount.serviceCompany.postalAddress?.fullName ? (
                    <Typography variant="caption">
                      {user.userAccount.serviceCompany.postalAddress?.fullName}
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
                formik.touched.customerAddress && formik.errors.customerAddress
              ),
              onBlur: formik.handleBlur,
              onChange: formik.handleChange,
              required: true,
            }}
          />
          <FormInput
            props={{
              name: 'invoiceNumber',
              label: t('Invoice number'),
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
              rows: 6,
            }}
          />

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center">
            <Typography variant="body2">{t('Initial amount')}</Typography>
            <TextField
              name="initialAmount"
              size="small"
              value={formik.values.initialAmount}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              error={
                !!(formik.touched.initialAmount && formik.errors.initialAmount)
              }
              sx={{width: '120px'}}
              InputProps={{
                inputProps: {
                  type: 'number',
                  min: 0,
                },
                startAdornment: (
                  <InputAdornment position="start">
                    {getCurrencySymbol[invoice?.totalAmount.currency ?? 'EUR']}
                  </InputAdornment>
                ),
              }}
              required
            />
          </Box>

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center">
            <Typography variant="body2">{t('Handling fee')}</Typography>
            <TextField
              name="handlingFee"
              size="small"
              value={formik.values.handlingFee}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              error={
                !!(formik.touched.handlingFee && formik.errors.handlingFee)
              }
              sx={{width: '120px'}}
              InputProps={{
                inputProps: {
                  type: 'number',
                  min: 0,
                },
                startAdornment: (
                  <InputAdornment position="start">
                    {getCurrencySymbol[invoice?.totalAmount.currency ?? 'EUR']}
                  </InputAdornment>
                ),
              }}
              required
            />
          </Box>

          <Box
            bgcolor="grey.700"
            borderRadius="4px"
            p="0.75rem"
            display="flex"
            justifyContent="space-between">
            <Typography sx={{color: 'primary.contrastText'}}>
              {t('Total amount')}
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
      ) : (
        <Delayed waitBeforeShow={8000}>
          <PDFPreview
            pdfUrl={downloadUrl ? Object.values(downloadUrl)[0] : ''}
          />
        </Delayed>
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
        confirmBtnDisabled={formik.isSubmitting}
        email={
          invoice?.propertyOwner?.additionalInfo.billingEmail ||
          invoice?.propertyOwner?.contact.email
        }
        subject={formik.values.subject}
        content={formik.values.description}
        callback={(values) => onSubmitHandler(values)}
        loadingProgress={isEditing ? fakeProgress : 0}
      />
    </>
  );
};

export default InvoiceOverdueNotice;
