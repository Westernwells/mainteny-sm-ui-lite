/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-await-in-loop */
import {useEffect, useState, useRef} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';
import * as Yup from 'yup';
import {useFormik} from 'formik';
import useTheme from '@mui/material/styles/useTheme';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import RadioGroup from '@mui/material/RadioGroup';
import DraftsIcon from '@mui/icons-material/Drafts';
import DeleteIcon from '@mui/icons-material/Delete';
import {SelectCombined} from 'components/SelectCombined';
import {ArticleItemsTable} from 'components/ArticleItemsTable';
import {CustomersDataGrid} from 'components/DataGrid/CustomersDataGrid';
import {ServiceOrdersDataGrid} from 'components/DataGrid/ServiceOrderDataGrid';
import {BottomDrawer} from 'components/BottomDrawer';
import {FormLabel} from 'components/form/FormLabel';
import {FormInput} from 'components/form/FormInput';
import {FormRadio} from 'components/form/FormRadio';
import {FormCheckbox} from 'components/form/FormCheckbox';
import {DatePicker} from 'components/DatePicker';
import {ServiceOrderTypeText} from 'components/ServiceOrderTypeText';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {
  useCreateInvoice,
  usePublishInvoice,
  fetchInvoice,
} from 'hooks/reactQuery/useInvoice';
import {CreateInvoice, InvoiceItemRecord, InvoiceType} from 'models/invoice';
import {ServiceOrderView} from 'models/service-order';
import {addYears} from 'date-fns';
import {
  PropertyOwnerSimpleView,
  PropertyOwnerView,
} from 'models/propertyManager';
import {Amount, PdfGenerationStatus, WithOptional} from 'models/misc';
import {convertToText, waitForSeconds} from 'utils/utils';
import {SendEmailDialog} from 'components/SendEmailDialog';
import {fetchServiceOrderWorkReport} from 'hooks/reactQuery/useServiceOrder';
import {fetchDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {useSnackbar} from 'hooks/useSnackbar';

interface Props {
  serviceOrderResource?: ServiceOrderView;
}

const payment = {
  accountNumber: '',
  bic: '',
  iban: '',
};

const dateToString = (date: Date) => date.toISOString().split('T')[0];

export const DraftInvoice = ({serviceOrderResource}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const {enqueueSnackbar} = useSnackbar();
  const {mutateAsync: publishInvoice, isLoading: publishingInvoice} =
    usePublishInvoice();

  const {user} = useUserSession();

  const {mutateAsync: createNewInvoice, isLoading: isCreating} =
    useCreateInvoice();
  const [isSendEmailDialogOpen, setIsSendEmailDialogOpen] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [isDrawerOpen] = useState<boolean>(true);

  const [customer, setCustomer] = useState<
    PropertyOwnerView | PropertyOwnerSimpleView | undefined
  >(undefined);
  const [serviceOrder, setServiceOrder] = useState<
    ServiceOrderView | undefined
  >(serviceOrderResource ?? undefined);

  const [invoiceItems, setInvoiceItems] = useState<InvoiceItemRecord<Amount>[]>(
    [],
  );

  const [dueDate, setDueDate] = useState<Date | null>(null);

  const invoiceTyoeOptions = useRef([
    {
      value: InvoiceType.FULL,
      label: 'Full',
    },
    {
      value: InvoiceType.PARTIAL,
      label: 'Partial',
    },
    {
      value: InvoiceType.CREDIT_NOTE,
      label: 'Credit Note',
    },
  ]).current;

  const initialValues: CreateInvoice = {
    subject: '',
    description: '',
    dueDate: '',
    issuedDate: dateToString(new Date()),
    type: InvoiceType.FULL,
    items: [],
    paymentTerms: '',
    propertyOwnerId: '',
    serviceCompanyId: '',
    serviceOrderId: '',
    paymentInfo: payment,
    shouldSendOut: false,
    includeWorkReport: true,
    costCenter: '',
    customerSpecificOrderNumber: '',
  };

  const validationSchema = Yup.object().shape({
    subject: Yup.string().required('Subject is required'),
  });
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      const response = await save(values);
      navigate(`/invoices/details/${response.value}`);
    },
  });

  async function save(values: CreateInvoice) {
    if (!values.description.length) values.description = ' ';

    const dueDateToString =
      formik.values.type === InvoiceType.CREDIT_NOTE
        ? dateToString(addYears(new Date(), 1))
        : values.dueDate;

    return createNewInvoice({
      data: {...values, dueDate: dueDateToString},
    });
  }

  const waitForPdfGeneration = async (id: string) => {
    setGeneratingPDF(true);
    let loop = true;
    let workReport;
    if (!id) {
      return;
    }
    let invoice = await fetchInvoice(id);

    if (!invoice) {
      return;
    }

    if (invoice.serviceOrder) {
      workReport = await fetchServiceOrderWorkReport(invoice.serviceOrder.id);
    }

    while (loop) {
      const invoiceCondition = invoice.additionalInfo.pdfGenerationStatus;
      const workReportCondition =
        workReport?.additionalInfo.pdfGenerationStatus;
      switch (invoiceCondition) {
        case PdfGenerationStatus.RUNNING:
        case PdfGenerationStatus.INIT:
          console.log(invoiceCondition, 'invoice initial', workReportCondition);
          invoice = await fetchInvoice(id);
          break;
        case PdfGenerationStatus.DONE:
          console.log(invoiceCondition, 'invoice final');
          loop = false;
          break;
        default:
          console.log('error occured');
          loop = false;
          break;
      }

      await waitForSeconds(5);
    }

    const serviceCompanyId = user?.userAccount.serviceCompany.id;
    const downloadUrl = await fetchDownloadUrl(
      [invoice.additionalInfo.pdfPath],
      serviceCompanyId!,
    );

    const isInvoicePDFGenerated =
      invoice.additionalInfo.pdfGenerationStatus === PdfGenerationStatus.DONE &&
      downloadUrl;

    const isWorkReportPDFGenerated = invoice?.additionalInfo?.includeWorkReport
      ? workReport?.additionalInfo?.pdfGenerationStatus ===
        PdfGenerationStatus.DONE
      : true;

    const pdfGenerated = !!isWorkReportPDFGenerated && !!isInvoicePDFGenerated;
    setGeneratingPDF(false);
    if (!pdfGenerated) {
      return false;
    }
    return true;
  };

  const handleSelectCustomer = (row: PropertyOwnerView) => {
    setCustomer(row);
  };

  const handleSelectServiceOrder = (row: ServiceOrderView) => {
    setServiceOrder(row);
  };

  useEffect(() => {
    if (user && user.userAccount) {
      formik.setFieldValue(
        'serviceCompanyId',
        user.userAccount.serviceCompany.id,
        true,
      );
    }
  }, [user]);

  useEffect(() => {
    if (dueDate) formik.setFieldValue('dueDate', dateToString(dueDate), true);
  }, [dueDate]);

  useEffect(() => {
    if (serviceOrder) {
      setCustomer(serviceOrder.elevator.propertyOwner);

      formik.setFieldValue(
        'propertyOwnerId',
        serviceOrder.elevator.propertyOwner.id,
        true,
      );
      formik.setFieldValue(
        'serviceCompanyId',
        serviceOrder.serviceCompany.id,
        true,
      );
      formik.setFieldValue('serviceOrderId', serviceOrder.id, true);

      if (
        formik.values.type !== InvoiceType.PARTIAL &&
        'articles' in serviceOrder &&
        serviceOrder.articles.length
      ) {
        const items = serviceOrder.articles.map(
          (i): InvoiceItemRecord<Amount> => ({
            articleId: i.article.id,
            articleUnit: i.article.unit,
            description: i.description,
            name: i.name,
            quantity: i.quantity,
            unitAmount: i.unitAmount,
          }),
        );
        setInvoiceItems(items);
      }
    } else if (formik.values.type !== InvoiceType.PARTIAL) {
      setInvoiceItems([]);
    }
  }, [formik.values.type, serviceOrder]);

  useEffect(() => {
    formik.setFieldValue(
      'items',
      invoiceItems.map(
        (item): WithOptional<InvoiceItemRecord<Amount>, 'articleUnit'> => ({
          articleId: item.articleId,
          description: item.description,
          name: item.name,
          quantity: item.quantity,
          unitAmount: item.unitAmount,
        }),
      ),
      true,
    );
  }, [invoiceItems]);

  const isValid = () => {
    const valid =
      formik.values.subject &&
      formik.values.type.length &&
      formik.values.items.length &&
      serviceOrder !== undefined;
    if (formik.values.type !== InvoiceType.CREDIT_NOTE) {
      return !!(valid && dueDate !== null);
    }
    return !!valid;
  };

  return (
    <Box>
      <Box
        width="min(calc(1240px + 1.25em), 100%)"
        mx="auto"
        mb="8em"
        mt="1.5em">
        <Box
          p="1em"
          bgcolor="grey.300"
          border="2px solid"
          borderColor="text.disabled"
          borderRadius=".5em">
          <Box bgcolor="white" p="1em">
            <Box display="flex" mt="1em" gap="2em">
              <Box
                flexGrow={1}
                display="flex"
                flexDirection="column"
                gap="1.5rem">
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
                  selected={customer !== undefined}
                  label="To"
                  buttonText="Select Customer"
                  cardHeader={
                    customer && (
                      <Typography variant="body2">{customer.name}</Typography>
                    )
                  }
                  cardBody={
                    customer && (
                      <>
                        <Typography variant="caption">
                          {customer.postalAddress.fullName}
                        </Typography>
                        <Typography variant="caption" component="p">
                          {customer.contact.phone}
                        </Typography>
                      </>
                    )
                  }
                  cardOnClose={() => {
                    setCustomer(undefined);
                    setServiceOrder(undefined);
                  }}
                  modalHeader="Select Customer"
                  modalBody={
                    <CustomersDataGrid setRowItem={handleSelectCustomer} />
                  }
                  labelRequired
                />
                <SelectCombined
                  selected={serviceOrder !== undefined}
                  label="Order Number"
                  buttonText="Select Order"
                  cardHeader={
                    serviceOrder && (
                      <Typography variant="body2">
                        {serviceOrder.number}
                      </Typography>
                    )
                  }
                  cardBody={
                    serviceOrder && (
                      <>
                        <ServiceOrderTypeText
                          serviceOrderType={serviceOrder.type}
                          capitalizeText
                          variant="caption"
                        />
                        <Typography variant="caption" component="p">
                          {serviceOrder.schedules.length
                            ? `${serviceOrder.schedules[0].technician.userAccount.firstName} ${serviceOrder.schedules[0].technician.userAccount.lastName}`
                            : '-'}
                        </Typography>
                      </>
                    )
                  }
                  cardOnClose={() => setServiceOrder(undefined)}
                  modalHeader="Select Order"
                  modalBody={
                    <ServiceOrdersDataGrid
                      setRowItem={handleSelectServiceOrder}
                      searchCustomer={customer?.name}
                    />
                  }
                  labelRequired
                />
              </Box>
              <Box
                width="35%"
                display="flex"
                flexDirection="column"
                gap="1.5rem"
                px="2rem">
                {[
                  {
                    label: 'Invoice Type',
                    value: formik.values.type
                      ? `${convertToText(formik.values.type)} invoice`
                      : '-',
                  },
                  {
                    label: 'Unit Number',
                    value: serviceOrder?.elevator.externalId || '-',
                  },
                ].map((i) => (
                  <Box key={i.label}>
                    <FormLabel text={i.label} />
                    <Typography>{i.value}</Typography>
                  </Box>
                ))}
                <FormInput
                  props={{
                    id: 'customerSpecificOrderNumber',
                    placeholder: 'e.g 000 000 000',
                    label: 'Customer specific order number',
                    value: formik.values.customerSpecificOrderNumber,
                    onChange: formik.handleChange,
                    onBlur: formik.handleBlur,
                    error: !!(
                      formik.touched.customerSpecificOrderNumber &&
                      formik.errors.customerSpecificOrderNumber
                    ),
                    helperText:
                      formik.touched.customerSpecificOrderNumber &&
                      formik.errors.customerSpecificOrderNumber,
                  }}
                />
                <FormInput
                  props={{
                    id: 'costCenter',
                    placeholder: 'e.g 000 000 000',
                    label: 'Cost Center',
                    value: formik.values.costCenter,
                    onChange: formik.handleChange,
                    onBlur: formik.handleBlur,
                    error: !!(
                      formik.touched.costCenter && formik.errors.costCenter
                    ),
                    helperText:
                      formik.touched.costCenter && formik.errors.costCenter,
                  }}
                />
              </Box>
            </Box>

            <Box mt="2em">
              <Typography variant="body1" color={theme.palette.text.secondary}>
                {t('Invoice Type')}
              </Typography>
              <RadioGroup
                name="radio-buttons-group"
                sx={{flexDirection: 'row'}}>
                {invoiceTyoeOptions.map((option) => (
                  <FormRadio
                    key={option.value}
                    name="type"
                    value={option.value}
                    checked={formik.values.type === option.value}
                    handleChange={formik.handleChange}
                    label={t(option.label)}
                    radioProps={{
                      sx: {color: theme.palette.text.secondary},
                    }}
                  />
                ))}
              </RadioGroup>
            </Box>

            {formik.values.type !== InvoiceType.CREDIT_NOTE && (
              <>
                <Box mt="2em" width="32ch">
                  <Typography
                    variant="body1"
                    color={theme.palette.text.secondary}>
                    {t('Work Report')}
                  </Typography>
                  <FormCheckbox
                    checked={formik.values.includeWorkReport}
                    name="includeWorkReport"
                    handleChange={formik.handleChange}
                    label={t('Add work report to invoice')}
                  />
                </Box>
                <Box mt="2em" width="32ch">
                  <DatePicker
                    defaultDate={dueDate}
                    minDate={new Date()}
                    getSelectedDate={(newValue) => {
                      if (newValue) setDueDate(newValue);
                    }}
                    textFieldProps={{
                      label: 'Due Date',
                      InputLabelProps: {shrink: true},
                    }}
                    required
                  />
                </Box>
              </>
            )}

            {[
              {
                id: 'subject',
                value: formik.values.subject,
                error: !!(formik.touched.subject && formik.errors.subject),
                helperText: formik.touched.subject && formik.errors.subject,
                minRows: 1,
                maxRows: 3,
                required: true,
              },
              {
                id: 'description',
                value: formik.values.description,
                error: false,
                helperText: undefined,
                minRows: 2,
                maxRows: 6,
                required: false,
              },
            ].map((i) => (
              <Box mt="1em" key={i.id}>
                <FormLabel text={i.id} required={i.required} />
                <FormInput
                  props={{
                    id: i.id,
                    value: i.value,
                    onChange: formik.handleChange,
                    onBlur: formik.handleBlur,
                    error: i.error,
                    helperText: i.helperText,
                    minRows: i.minRows,
                    maxRows: i.maxRows,
                    multiline: true,
                    fullWidth: true,
                  }}
                />
              </Box>
            ))}

            <ArticleItemsTable
              items={invoiceItems}
              setItems={setInvoiceItems}
              isPartial={!(formik.values.type !== InvoiceType.PARTIAL)}
              isCreditNote={formik.values.type === InvoiceType.CREDIT_NOTE}
            />

            <Box my="1.5em">
              <FormLabel text="Additional Information" />
              <FormInput
                props={{
                  id: 'paymentTerms',
                  value: formik.values.paymentTerms,
                  onChange: formik.handleChange,
                  minRows: 2,
                  maxRows: 4,
                  multiline: true,
                  fullWidth: true,
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      <BottomDrawer
        isOpen={isDrawerOpen}
        isSaving={isCreating || generatingPDF}
        primaryButtonLabel={generatingPDF ? 'Generating pdfs...' : t('Save')}
        primaryButtonAction={formik.handleSubmit}
        listItems={[
          {
            label: t('Save & Send'),
            icon: <DraftsIcon />,
            onClick: async () => {
              setIsSendEmailDialogOpen(true);
            },
          },
          {
            label: t('Discard'),
            icon: <DeleteIcon />,
            onClick: () => {
              navigate(-1);
            },
          },
        ]}
        isValid={isValid()}
      />
      <SendEmailDialog
        open={isSendEmailDialogOpen}
        onClose={() => setIsSendEmailDialogOpen(false)}
        confirmBtnDisabled={generatingPDF || publishingInvoice || isCreating}
        callback={async (emailRecord) => {
          const response = await save(formik.values);
          setIsSendEmailDialogOpen(false);
          enqueueSnackbar('Generating PDFs, please wait...', {
            variant: 'info',
          });
          const isPDFsGenerated = await waitForPdfGeneration(response.value);
          if (isPDFsGenerated) {
            await publishInvoice({
              id: response.value,
              body: {
                email: emailRecord.email,
                subject: emailRecord.subject,
                content: emailRecord.content,
              },
            });
          } else {
            enqueueSnackbar('PDF generation failed', {
              variant: 'error',
            });
          }
        }}
      />
    </Box>
  );
};
