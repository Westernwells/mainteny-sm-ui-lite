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
import {getInvoiceStatusStyles} from 'pages/Invoices/InvoicesDataGridProps';
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
import {Confirm} from 'components/Confirm';
import {StatusChip} from 'components/StatusChip';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {
  useCreateInvoice,
  useDeleteInvoice,
  useUpdateInvoice,
} from 'hooks/reactQuery/useInvoice';
import {
  CreateInvoice,
  UpdateInvoice,
  InvoiceItemRecord,
  InvoiceView,
  InvoiceType,
} from 'models/invoice';
import {ServiceOrderView} from 'models/service-order';
import {addYears} from 'date-fns';
import {
  PropertyOwnerSimpleView,
  PropertyOwnerView,
} from 'models/propertyManager';
import {Amount, WithOptional} from 'models/misc';
import {convertToText} from 'utils/utils';
import {useFormatDate} from 'hooks/useFormatDate';
import {Notes} from './Notes';

interface Props {
  invoice?: InvoiceView;
  serviceOrderResource?: ServiceOrderView;
}

const payment = {
  accountNumber: '',
  bic: '',
  iban: '',
};

const dateToString = (date: Date) => date.toISOString().split('T')[0];

export const DraftInvoice = ({invoice, serviceOrderResource}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const formatDate = useFormatDate();
  const navigate = useNavigate();

  const {user} = useUserSession();

  const {mutate: createNewInvoice} = useCreateInvoice();
  const {mutate: updateInvoice} = useUpdateInvoice();
  const {mutate: deleteInvoice} = useDeleteInvoice();

  const [isDrawerOpen] = useState<boolean>(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [customer, setCustomer] = useState<
    PropertyOwnerView | PropertyOwnerSimpleView | undefined
  >(undefined);
  const [serviceOrder, setServiceOrder] = useState<
    ServiceOrderView | undefined
  >(serviceOrderResource ?? undefined);

  const [invoiceItems, setInvoiceItems] = useState<InvoiceItemRecord<Amount>[]>(
    [],
  );

  const [dueDate, setDueDate] = useState<Date | null>(
    invoice ? new Date(invoice.dueDate) : null,
  );

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
    onSubmit: (values) => {
      if (!values.description.length) values.description = ' ';

      const dueDateToString =
        formik.values.type === InvoiceType.CREDIT_NOTE
          ? dateToString(addYears(new Date(), 1))
          : values.dueDate;

      if (invoice)
        updateInvoice({
          data: {
            ...values,
            dueDate: dueDateToString,
          } as UpdateInvoice,
          invoiceId: invoice.id,
        });
      else createNewInvoice({data: {...values, dueDate: dueDateToString}});
    },
  });

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
    if (invoice) {
      setInvoiceItems(
        invoice.items.map(
          (i): InvoiceItemRecord<Amount> => ({
            articleId: i.article.id,
            description: i.description || i.article.description,
            name: i.name || i.article.name,
            articleUnit: i.article.unit,
            quantity: i.quantity,
            unitAmount: i.unitAmount,
          }),
        ),
      );

      setServiceOrder(invoice.serviceOrder);
      setCustomer(invoice.serviceOrder?.elevator.propertyOwner);

      formik.setFieldValue('subject', invoice.subject, true);
      formik.setFieldValue('description', invoice.description, true);
      formik.setFieldValue('type', invoice.type, true);
      formik.setFieldValue('paymentTerms', invoice.paymentTerms, true);
      formik.setFieldValue('issuedDate', invoice.issuedDate, true);
      formik.setFieldValue('dueDate', invoice.dueDate, true);
      formik.setFieldValue('serviceOrderId', invoice.serviceOrder?.id, true);
    }
  }, [invoice]);

  useEffect(() => {
    if (!invoice && serviceOrder) {
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
    } else if (!invoice && formik.values.type !== InvoiceType.PARTIAL) {
      setInvoiceItems([]);
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
                  {
                    label: 'Created By',
                    value: invoice?.meta.creator
                      ? `${invoice.meta.creator?.firstName} ${invoice.meta.creator?.lastName}`
                      : `${user?.userAccount.firstName} ${user?.userAccount.lastName}`,
                  },
                  {
                    label: 'Date Created',
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
        primaryButtonLabel={invoice ? t('Send') : t('Save')}
        primaryButtonAction={formik.handleSubmit}
        listItems={
          invoice
            ? [
                {
                  label: t('Save Drafts'),
                  icon: <DraftsIcon />,
                  onClick: () => formik.handleSubmit(),
                },
                {
                  label: 'Delete Invoice',
                  icon: <DeleteIcon />,
                  onClick: () => {
                    setIsDeleteDialogOpen(true);
                  },
                },
              ]
            : [
                {
                  label: t('Save & Send'),
                  icon: <DraftsIcon />,
                  onClick: () => formik.handleSubmit,
                },
                {
                  label: 'Discard',
                  icon: <DeleteIcon />,
                  onClick: () => {
                    navigate(-1);
                  },
                },
              ]
        }
        isValid={isValid()}
      />
      <Confirm
        open={isDeleteDialogOpen}
        onConfirm={() => {
          if (invoice && invoice.id)
            deleteInvoice({invoiceId: invoice.id, shouldNavigate: true});
          setIsDeleteDialogOpen(false);
        }}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Delete Invoice"
        content="Do you want to delete this Invoice?"
        helperText="This action is irreversible."
      />
    </Box>
  );
};
