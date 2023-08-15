/* eslint-disable @typescript-eslint/no-use-before-define */
import {useEffect, useMemo, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';
import * as Yup from 'yup';
import {useFormik} from 'formik';
import printJS from 'print-js';
import useTheme from '@mui/material/styles/useTheme';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import RadioGroup from '@mui/material/RadioGroup';
import DeleteIcon from '@mui/icons-material/Delete';
import RemoveRedEye from '@mui/icons-material/RemoveRedEye';
import Print from '@mui/icons-material/Print';
import Send from '@mui/icons-material/Send';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import {getInvoiceStatusStyles} from 'pages/Invoices/InvoicesDataGridProps';
import {SelectCombined} from 'components/SelectCombined';
import {SelectAndEditCombined} from 'components/SelectAndEditCombined';
import {ArticleItemsTable} from 'components/ArticleItemsTable';
import {CustomersDataGrid} from 'components/DataGrid/CustomersDataGrid';
import {ServiceOrdersDataGrid} from 'components/DataGrid/ServiceOrderDataGrid';
import {BottomDrawer} from 'components/BottomDrawer';
import {FormLabel} from 'components/form/FormLabel';
import {FormInput} from 'components/form/FormInput';
import {DatePicker} from 'components/DatePicker';
import {ServiceOrderTypeText} from 'components/ServiceOrderTypeText';
import {Confirm} from 'components/Confirm';
import {StatusChip} from 'components/StatusChip';
import {FormRadio} from 'components/form/FormRadio';
import {Button} from 'components/Button';
import {SendEmailDialog} from 'components/SendEmailDialog';
import {ConfirmPrintInvoice} from 'components/ConfirmPrintInvoice';
import {Tooltip} from 'components/Tooltip';
import {InfoCard} from 'components/InfoCard';
import {EmptySection} from 'components/EmptySection';
import {ContractPaymentTermSelectDialog} from 'components/ContractPaymentTermSelectDialog';
import {ContractPaymentTermsDialog} from 'components/ContractPaymentTermsDialog';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {
  useCreateInvoice,
  useDeleteInvoice,
  usePublishInvoice,
  useUpdateInvoice,
} from 'hooks/reactQuery/useInvoice';
import {
  InvoiceItemRecord,
  InvoiceView,
  InvoiceType,
  InvoiceStatus,
  InvoiceFormData,
} from 'models/invoice';
import {ServiceOrderView} from 'models/service-order';
import {
  PropertyOwnerSimpleView,
  PropertyOwnerView,
} from 'models/propertyManager';
import {Amount, PdfGenerationStatus, WithOptional} from 'models/misc';
import {useFormatDate} from 'hooks/useFormatDate';
import {Notes} from 'pages/InvoiceDetails/Notes';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {convertToText} from 'utils/utils';
import {addYears} from 'date-fns';
import {InvoiceCheckbox} from 'pages/InvoiceDetails/InvoiceCheckbox';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {IconButton} from '@mui/material';
import {useQueryContractPaymentTerms} from 'hooks/reactQuery/useCompanies';
import {createEmptyResource} from 'utils/paging-utils';
import {BeneficiaryDetails} from './BeneficiaryDetails';
import {formatInvoiceRecord} from './utils';

interface Props {
  invoice?: InvoiceView;
  serviceOrderResource?: ServiceOrderView;
  formType?: 'new' | 'edit';
  invoiceType?: InvoiceType;
}

const payment = {
  accountNumber: '',
  bic: '',
  iban: '',
};

const dateToString = (date: Date) => date.toISOString().split('T')[0];

const toolTipText = (
  <div>
    Full - Standard invoice for the full amount. <br />
    Partial - Partial payment when less than the full amount is due.
    <br />
    Final - Final invoice after partial invoices have been created before.
    <br />
    Credit note - Is issued to indicate a return of funds.
    <br />
  </div>
);

const alternativeInvoiceDestinationTooltip =
  'Enter address to receive invoice if different from billing or shipping address. Ensure accuracy to prevent misdelivery.';

const pageSize = 50;

export const InvoiceForm = ({
  invoice,
  serviceOrderResource,
  formType = 'new',
  invoiceType,
}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const formatDate = useFormatDate();
  const navigate = useNavigate();

  const {user} = useUserSession();

  const {mutateAsync: updateInvoiceAsync, isLoading: isUpdating} =
    useUpdateInvoice();
  const {mutateAsync: createNewInvoice, isLoading: isCreating} =
    useCreateInvoice();
  const {mutate: deleteInvoice} = useDeleteInvoice();
  const {mutateAsync: publishInvoice, isLoading: isPublishing} =
    usePublishInvoice({
      shouldNavigate: false,
    });
  const {data: downloadUrl} = useDownloadUrl(
    invoice ? [invoice.additionalInfo.pdfPath] : [],
  );

  const [isDrawerOpen] = useState<boolean>(true);
  const [isSendEmailDialogOpen, setIsSendEmailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isConfirmPrintDialogOpen, setIsConfirmPrintDialogOpen] =
    useState(false);
  const [openContractPaymentTermsDialog, setOpenContractPaymentTermsDialog] =
    useState(false);
  const [
    openContractPaymentTermSelectDialog,
    setOpenContractPaymentTermSelectDialog,
  ] = useState(false);
  const [showCheckListTooltip, setShowCheckListTooltip] = useState(false);
  const [showWorkReportTooltip, setShowWorlReportTooltip] = useState(false);
  const [isInvoicePDFGenerated] = useState(
    invoice?.additionalInfo.pdfGenerationStatus === PdfGenerationStatus.DONE,
  );

  const [customer, setCustomer] = useState<
    PropertyOwnerView | PropertyOwnerSimpleView | undefined
  >(undefined);
  const [serviceOrder, setServiceOrder] = useState<
    ServiceOrderView | undefined
  >(serviceOrderResource ?? undefined);

  const [isWorkReportPDFGenerated, setIsWorkReportPDFGenerated] = useState(
    !!serviceOrder?.additionalInfo.workReportGenerated,
  );
  const [isCheckListPDFGenerated, setIsCheckListPDFGenerated] = useState(
    serviceOrder?.additionalInfo.checkListInfo?.pdfGenerationStatus ===
      PdfGenerationStatus.DONE,
  );

  const [invoiceItems, setInvoiceItems] = useState<InvoiceItemRecord<Amount>[]>(
    [],
  );

  const [dueDate, setDueDate] = useState<Date | null>(
    invoice ? new Date(invoice.dueDate) : null,
  );

  const {data: contractPaymentTerms = createEmptyResource(pageSize)} =
    useQueryContractPaymentTerms({
      page: {
        pageIndex: 0,
        pageSize,
      },
      query: '',
    });

  const invoiceTypeOptions = useRef([
    {
      value: InvoiceType.FULL,
      label: 'Full',
    },
    {
      value: InvoiceType.PARTIAL,
      label: 'Partial',
    },
    {
      value: InvoiceType.FINAL,
      label: 'Final',
    },
    {
      value: InvoiceType.CREDIT_NOTE,
      label: 'Credit Note',
    },
  ]).current;

  const initialValues: InvoiceFormData = {
    subject:
      invoice?.subject ||
      t('Invoice {{invoiceNumber}} for Order {{orderNumber}}', {
        invoiceNumber: invoice?.number ?? '',
        orderNumber: serviceOrder?.number ?? '',
      }),
    description: invoice?.description || '',
    dueDate: '',
    issuedDate: dateToString(new Date()),
    type:
      typeof invoiceType === 'string' &&
      invoiceType &&
      invoiceType in InvoiceType
        ? InvoiceType[invoiceType as InvoiceType]
        : InvoiceType.FULL,
    items: [],
    paymentTerms: '',
    propertyOwnerId: '',
    serviceCompanyId: '',
    serviceOrderId: '',
    paymentInfo: payment,
    shouldSendOut: false,
    includeWorkReport: false,
    includeCheckList: false,
    beneficialName: invoice?.additionalInfo.beneficialDetails?.name || '',
    beneficialAddress: invoice?.additionalInfo.beneficialDetails?.address,
    costCenter: invoice?.additionalInfo?.costCenter || '',
    customerSpecificOrderNumber:
      invoice?.additionalInfo?.customerSpecificOrderNumber || '',
    moreInfo: invoice?.additionalInfo?.moreInfo ?? '',
    billingAddress: invoice?.additionalInfo?.billingAddress,
    beneficiaryAddress: invoice?.additionalInfo?.beneficiaryAddress,
    alternativeAddress: invoice?.additionalInfo?.alternativeAddress,
  };

  const validationSchema = Yup.object().shape({
    subject: Yup.string().required('Subject is required'),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    onSubmit: async (values) => {
      const response = await onSave(values);
      const invoiceId = formType === 'new' ? response.value : invoice?.id;
      navigate(`/invoices/details/${invoiceId}`);
    },
  });

  const handleSelectCustomer = (row: PropertyOwnerView) => {
    setCustomer(row);
    formik.setValues({
      ...formik.values,
      billingAddress: row.billingAddress,
      beneficiaryAddress: row.beneficiaryAddress,
      alternativeAddress: row.otherAddress,
    });
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
    const workReportGenerated =
      !!serviceOrder?.additionalInfo.workReportGenerated;
    const checkListGenerated =
      serviceOrder?.additionalInfo.checkListInfo?.pdfGenerationStatus ===
      PdfGenerationStatus.DONE;
    setIsWorkReportPDFGenerated(workReportGenerated);
    setIsCheckListPDFGenerated(checkListGenerated);
    formik.setFieldValue(
      'includeWorkReport',
      workReportGenerated || false,
      true,
    );
    formik.setFieldValue('includeCheckList', checkListGenerated || '', true);
  }, [serviceOrder]);

  useEffect(() => {
    if (invoice) {
      const invoiceCustomer = invoice.serviceOrder?.elevator.propertyOwner;
      setServiceOrder(invoice.serviceOrder);
      setCustomer(invoiceCustomer);
      formik.setValues({
        ...formik.values,
        billingAddress: invoiceCustomer?.billingAddress,
        beneficiaryAddress: invoiceCustomer?.beneficiaryAddress,
        alternativeAddress: invoiceCustomer?.otherAddress,
      });
    }

    formik.setFieldValue(
      'type',
      invoiceType || invoice?.type || InvoiceType.FULL,
      true,
    );
    formik.setFieldValue('paymentTerms', invoice?.paymentTerms || '', true);
    formik.setFieldValue('dueDate', invoice?.dueDate || '', true);
    formik.setFieldValue(
      'serviceOrderId',
      invoice?.serviceOrder?.id || '',
      true,
    );
  }, [invoice]);

  useEffect(() => {
    if (serviceOrder) {
      const serviceOrderCustomer = serviceOrder.elevator.propertyOwner;
      setCustomer(serviceOrderCustomer);

      // if customer is changed, then update billing address
      if (serviceOrderCustomer.id !== customer?.id) {
        formik.setValues({
          ...formik.values,
          billingAddress: serviceOrderCustomer?.billingAddress,
          beneficiaryAddress: serviceOrderCustomer?.beneficiaryAddress,
          alternativeAddress: serviceOrderCustomer?.otherAddress,
        });
      }

      formik.setFieldValue(
        'propertyOwnerId',
        serviceOrder.elevator.propertyOwner.id,
        true,
      );
      formik.setFieldValue(
        'serviceCompanyId',
        user?.userAccount.serviceCompany.id,
        true,
      );
      formik.setFieldValue('serviceOrderId', serviceOrder.id, true);
      formik.setFieldValue(
        'subject',
        t('Invoice {{invoiceNumber}} for Order {{orderNumber}}', {
          invoiceNumber: invoice?.number ?? '',
          orderNumber: serviceOrder?.number ?? '',
        }),
        true,
      );
    }
  }, [serviceOrder, formik.values.type]);

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

  const actions = useMemo(() => {
    const items = [
      {
        label: t('Save & Send'),
        icon: <Send />,
        onClick: () => {
          setIsSendEmailDialogOpen(true);
        },
      },
    ];
    if (
      invoice &&
      ![
        InvoiceStatus.NOT_PAID,
        InvoiceStatus.EXPIRED,
        InvoiceStatus.PARTIALLY_PAID,
      ].includes(invoice.status)
    ) {
      items.push({
        label: t('Delete'),
        icon: <DeleteIcon />,
        onClick: () => {
          setIsDeleteDialogOpen(true);
        },
      });
    }
    if (
      isInvoicePDFGenerated &&
      (invoice?.status === InvoiceStatus.DRAFT ||
        invoice?.status === InvoiceStatus.EXPIRED)
    ) {
      items.splice(1, 0, {
        label: t('Print'),
        icon: <Print />,
        onClick: () => setIsConfirmPrintDialogOpen(true),
      });
    }
    return items;
  }, [downloadUrl]);

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

  const handleCheckListMouseEnter = () => {
    if (!isCheckListPDFGenerated) {
      setShowCheckListTooltip(true);
    }
  };

  const handleCheckListMouseLeave = () => {
    if (showCheckListTooltip) {
      setShowCheckListTooltip(false);
    }
  };

  const handleWorkReportMouseEnter = () => {
    if (!isWorkReportPDFGenerated) {
      setShowWorlReportTooltip(true);
    }
  };

  const handleWorkReportMouseLeave = () => {
    if (showWorkReportTooltip) {
      setShowWorlReportTooltip(false);
    }
  };

  async function onSave(values: InvoiceFormData) {
    if (!values.description.length) values.description = ' ';
    if (!values?.moreInfo?.length) values.moreInfo = ' ';

    const dueDateToString: string =
      formik.values.type === InvoiceType.CREDIT_NOTE
        ? dateToString(addYears(new Date(), 1))
        : values.dueDate;

    if (formType === 'edit' && invoice) {
      return updateInvoiceAsync({
        data: formatInvoiceRecord({
          ...values,
          includeWorkReport: values.includeWorkReport,
          includeCheckList: values.includeCheckList,
          dueDate: dueDateToString,
        }),
        invoiceId: invoice.id,
      });
    }

    return createNewInvoice({
      data: formatInvoiceRecord({
        ...values,
        includeWorkReport: values.includeWorkReport,
        includeCheckList: values.includeCheckList,
        dueDate: dueDateToString,
      }),
    });
  }

  const onPrintInvoice = async () => {
    if (invoice) {
      await onSave(formik.values);
      await publishInvoice(
        {
          id: invoice.id,
          body: {
            email: '',
            subject: '',
            content: '',
          },
        },
        {
          onSuccess: () => {
            setIsConfirmPrintDialogOpen(false);
            if (downloadUrl) {
              printJS({
                printable: Object.values(downloadUrl)[0],
                type: 'pdf',
                showModal: true,
              });
            }
          },
        },
      );
    }
  };

  const handleContractPaymentTermsModal = (paymentTermId: string) => {
    const paymentTermObj = contractPaymentTerms?.data.find(
      ({id}) => id === paymentTermId,
    );
    formik.setFieldValue('paymentTerms', paymentTermObj?.term);
    setOpenContractPaymentTermsDialog(false);
  };

  const removeAddress = (
    addressType: 'billingAddress' | 'beneficiaryAddress' | 'alternativeAddress',
  ) => {
    formik.setFieldValue(addressType, undefined);
  };

  return (
    <Box>
      {invoice && (
        <Box
          display="flex"
          alignItems="flex-end"
          justifyContent="space-between">
          <StatusChip
            label={getInvoiceStatusStyles(invoice?.status ?? '').label}
            color={getInvoiceStatusStyles(invoice?.status ?? '').color}
            size="small"
            variant="filled"
          />
          <Notes invoice={invoice!} />
        </Box>
      )}
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
                  label={
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center">
                      <FormLabel text={t('Customer')} required />
                      <Button
                        label="Add New Customer"
                        buttonProps={{
                          size: 'small',
                          startIcon: <AddIcon />,
                          onClick: () => navigate('/customers/new'),
                        }}
                      />
                    </Box>
                  }
                  buttonText="Select Customer"
                  cardHeader={
                    customer && (
                      <Typography variant="body2">{customer.name}</Typography>
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

                {customer && (
                  <>
                    <SelectAndEditCombined
                      selected={!!formik.values.billingAddress}
                      label="Billing Address"
                      buttonText="Add Billing Address"
                      cardHeader={
                        formik.values.billingAddress ? (
                          <Typography variant="body2">
                            {formik.values.billingAddress.fullName}
                          </Typography>
                        ) : null
                      }
                      cardOnClose={() => removeAddress('billingAddress')}
                      editButtonText="Edit Billing Address"
                      modalHeader="Edit Billing Address"
                      addressType="billingAddress"
                      formik={formik}
                    />

                    <SelectAndEditCombined
                      selected={!!formik.values.beneficiaryAddress}
                      label="Beneficiary Address"
                      buttonText="Add Beneficiary Address"
                      cardHeader={
                        formik.values.beneficiaryAddress ? (
                          <Typography variant="body2">
                            {formik.values.beneficiaryAddress.fullName}
                          </Typography>
                        ) : null
                      }
                      cardOnClose={() => removeAddress('beneficiaryAddress')}
                      editButtonText="Edit Beneficiary Address"
                      modalHeader="Edit Beneficiary Address"
                      addressType="beneficiaryAddress"
                      formik={formik}
                    />

                    <SelectAndEditCombined
                      selected={!!formik.values.alternativeAddress}
                      label={
                        <Box>
                          <FormLabel
                            text={t('Alternative Invoice Destination')}
                          />
                          <Tooltip
                            title={t(alternativeInvoiceDestinationTooltip)}
                            placement="top"
                            componentsProps={{
                              tooltip: {
                                sx: {
                                  bgcolor: 'common.gray',
                                  maxWidth: 500,
                                  padding: '1em',
                                  fontSize: '0.85rem',
                                },
                              },
                            }}>
                            <IconButton sx={{fontSize: '1.375rem'}}>
                              <InfoOutlinedIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      }
                      buttonText="Add Alternative Address"
                      cardHeader={
                        formik.values.alternativeAddress ? (
                          <Typography variant="body2">
                            {formik.values.alternativeAddress.fullName}
                          </Typography>
                        ) : null
                      }
                      cardOnClose={() => removeAddress('alternativeAddress')}
                      editButtonText="Edit Alternative Address"
                      modalHeader="Edit Alternative Address"
                      addressType="alternativeAddress"
                      formik={formik}
                    />
                  </>
                )}

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
                      propertyOwnerId={customer?.id ?? ''}
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
                      ? t(`${convertToText(formik.values.type)} invoice`)
                      : '-',
                  },
                  {
                    label: 'Unit Number',
                    value: serviceOrder?.elevator.externalId || '-',
                  },
                  {
                    label: 'Created By',
                    value: invoice?.meta.creator
                      ? `${invoice.meta.creator?.firstName} ${invoice.meta.creator?.lastName}`
                      : `${user?.userAccount.firstName} ${user?.userAccount.lastName}`,
                  },
                  {
                    label: 'Invoice Date',
                    value: formatDate(
                      invoice ? invoice.meta.createdAt : new Date(),
                    ),
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
                    label: 'Purchase order number',
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
                {t('Invoice Type')}{' '}
                <Tooltip
                  title={toolTipText}
                  placement="top"
                  componentsProps={{
                    tooltip: {
                      sx: {
                        bgcolor: 'common.gray',
                        maxWidth: 500,
                        padding: '1em',
                        fontSize: '0.85rem',
                      },
                    },
                  }}>
                  <IconButton>
                    <InfoOutlinedIcon />
                  </IconButton>
                </Tooltip>
              </Typography>

              <RadioGroup
                name="radio-buttons-group"
                sx={{flexDirection: 'row'}}>
                {(invoice?.type === InvoiceType.FULL ||
                  invoice?.type === InvoiceType.CREDIT_NOTE) &&
                !invoice.partialInvoices?.length
                  ? invoiceTypeOptions
                      .filter((option) => option.value !== InvoiceType.FINAL)
                      .map((option) => (
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
                          disabled={formType === 'edit'}
                        />
                      ))
                  : invoice?.type === InvoiceType.FINAL &&
                    invoice.partialInvoices?.length
                  ? invoiceTypeOptions
                      .filter((option) => option.value !== InvoiceType.FULL)
                      .map((option) => (
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
                          disabled={formType === 'edit'}
                        />
                      ))
                  : invoiceTypeOptions.map((option) => (
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
                        disabled={formType === 'edit'}
                      />
                    ))}
              </RadioGroup>
            </Box>

            {formik.values.type !== InvoiceType.CREDIT_NOTE && (
              <>
                <Box sx={{display: 'flex'}}>
                  <InvoiceCheckbox
                    onMouseEnter={handleWorkReportMouseEnter}
                    onMouseLeave={handleWorkReportMouseLeave}
                    checkboxName="includeWorkReport"
                    disabled={!isWorkReportPDFGenerated}
                    handleChange={formik.handleChange}
                    showTooltip={showWorkReportTooltip}
                    tooltipTitle="No work report for the selected service order"
                    title="Work Report"
                    checkboxLabel="Add work report to invoice"
                    checked={
                      isWorkReportPDFGenerated &&
                      formik.values.includeWorkReport
                    }
                  />

                  <InvoiceCheckbox
                    onMouseEnter={handleCheckListMouseEnter}
                    onMouseLeave={handleCheckListMouseLeave}
                    checkboxName="includeCheckList"
                    disabled={!isCheckListPDFGenerated}
                    handleChange={formik.handleChange}
                    showTooltip={showCheckListTooltip}
                    tooltipTitle="No checklist for selected service order"
                    title="Checklist"
                    checkboxLabel="Add checklist to invoice"
                    checked={
                      isCheckListPDFGenerated && formik.values.includeCheckList
                    }
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
              invoice={invoice}
              items={invoiceItems}
              setItems={setInvoiceItems}
              isPartial={!(formik.values.type !== InvoiceType.PARTIAL)}
              isCreditNote={formik.values.type === InvoiceType.CREDIT_NOTE}
              unitSellingAmount={invoice?.totalAmount}
              propertyOwnerId={customer?.id ?? ''}
              formType={formType}
            />

            <InfoCard
              containerStyles={{
                my: '1rem',
                boxShadow: 'none',
                border: '1px solid #E4E9F2',
              }}
              headerActionIcon={<EditIcon />}
              handleAction={() => setOpenContractPaymentTermSelectDialog(true)}
              showHeaderBackground
              header={
                <Typography variant="subtitle1">
                  {t('Payment Terms')}
                </Typography>
              }>
              {formik.values.paymentTerms ? (
                <Typography variant="body2">
                  {formik.values.paymentTerms}
                </Typography>
              ) : (
                <EmptySection
                  label="No payment terms applied"
                  illustration="clipboard"
                  size="tiny"
                  containerStyle={{
                    height: '100%',
                    gap: '0.5rem',
                  }}
                />
              )}
            </InfoCard>

            <Box my="1.5em">
              <FormLabel text="Additional Information" />
              <FormInput
                props={{
                  id: 'moreInfo',
                  name: 'moreInfo',
                  value: formik.values.moreInfo,
                  onChange: formik.handleChange,
                  minRows: 2,
                  maxRows: 4,
                  multiline: true,
                  fullWidth: true,
                }}
              />
            </Box>

            <BeneficiaryDetails formik={formik} />
          </Box>
        </Box>
      </Box>

      <BottomDrawer
        isOpen={isDrawerOpen}
        isSaving={isUpdating || isCreating}
        primaryButtonLabel={t('Save')}
        primaryButtonAction={formik.handleSubmit}
        listItems={actions.map((item) => ({
          ...item,
          showBorder: actions[actions.length - 1] !== item,
        }))}
        isValid={isValid()}
        secondaryButton={
          invoice?.status === InvoiceStatus.DRAFT ||
          invoice?.status === InvoiceStatus.EXPIRED ? (
            <Button
              label="Preview"
              buttonProps={{
                variant: 'outlined',
                sx: {bgcolor: theme.palette.inputBackground.main},
                startIcon: <RemoveRedEye />,
                onClick: () => navigate(`/invoices/details/${invoice.id}`),
              }}
            />
          ) : null
        }
      />
      <SendEmailDialog
        open={isSendEmailDialogOpen}
        onClose={() => setIsSendEmailDialogOpen(false)}
        confirmBtnDisabled={isPublishing || isUpdating || isCreating}
        callback={async (emailRecord) => {
          const response = await onSave(formik.values);
          setIsSendEmailDialogOpen(false);
          const invoiceId = formType === 'new' ? response.value : invoice?.id;
          await publishInvoice({
            id: invoiceId!,
            body: {
              email: emailRecord.email,
              subject: emailRecord.subject,
              content: emailRecord.content,
            },
          });
          navigate(`/invoices/details/${invoiceId}`);
        }}
        email={customer?.additionalInfo.billingEmail || customer?.contact.email}
        subject={formik.values.subject}
        content={formik.values.description}
      />
      <Confirm
        open={isDeleteDialogOpen}
        onConfirm={() => {
          if (invoice)
            deleteInvoice({invoiceId: invoice.id, shouldNavigate: true});
          setIsDeleteDialogOpen(false);
        }}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Delete Invoice"
        content="Do you want to delete this Invoice?"
        helperText="This action is irreversible."
      />
      <ConfirmPrintInvoice
        open={isConfirmPrintDialogOpen}
        onConfirm={onPrintInvoice}
        onClose={() => setIsConfirmPrintDialogOpen(false)}
      />

      <ContractPaymentTermSelectDialog
        title={t('Payment Terms')}
        alertText={t('Choose a payment term to be used on your invoice')}
        open={openContractPaymentTermSelectDialog}
        onSave={handleContractPaymentTermsModal}
        onCancel={() => setOpenContractPaymentTermSelectDialog(false)}
        onClickPaymentTerms={() => setOpenContractPaymentTermsDialog(true)}
      />

      <ContractPaymentTermsDialog
        title={t('Manage Payment Terms')}
        open={openContractPaymentTermsDialog}
        onCancel={() => setOpenContractPaymentTermsDialog(false)}
      />
    </Box>
  );
};
