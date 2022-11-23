import {useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import * as Yup from 'yup';
import {useFormik} from 'formik';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Send from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import {getQuotationStatusStyles} from 'pages/Quotations/QuotationsDataGridProps';
import {Notes} from 'pages/QuotationDetails/Notes';
import {A4Layout} from 'components/A4Layout';
import {SelectCombined} from 'components/SelectCombined';
import {ArticleItemsTable} from 'components/ArticleItemsTable';
import {CustomersDataGrid} from 'components/DataGrid/CustomersDataGrid';
import {UnitsDataGrid} from 'components/DataGrid/UnitsDataGrid';
import {BottomDrawer} from 'components/BottomDrawer';
import {FormLabel} from 'components/form/FormLabel';
import {FormInput} from 'components/form/FormInput';
import {Confirm} from 'components/Confirm';
import {StatusChip} from 'components/StatusChip';
import {SendEmailDialog} from 'components/SendEmailDialog';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {
  useDeleteQuotation,
  usePublishQuotation,
  useUpdateQuotation,
} from 'hooks/reactQuery/useQuotation';
import {
  CreateQuotation,
  UpdateQuotation,
  QuotationItemRecord,
  QuotationView,
} from 'models/quotation';
import {ElevatorSimpleView, ElevatorView} from 'models/elevator';
import {
  PropertyOwnerSimpleView,
  PropertyOwnerView,
} from 'models/propertyManager';
import {PdfGenerationStatus, WithOptional} from 'models/misc';
import {useFormatDate} from 'hooks/useFormatDate';

interface Props {
  quotation: QuotationView;
}

export const EditQuotation = ({quotation}: Props) => {
  const formatDate = useFormatDate();
  const {t} = useTranslation();

  const {user} = useUserSession();

  const {mutate: updateQuotation} = useUpdateQuotation();
  const {mutate: deleteQuotation} = useDeleteQuotation();

  const [isSendEmailDialogOpen, setIsSendEmailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [customer, setCustomer] = useState<
    PropertyOwnerView | PropertyOwnerSimpleView | null
  >(null);
  const [unit, setUnit] = useState<ElevatorView | ElevatorSimpleView | null>(
    null,
  );
  const [quotationItems, setQuotationItems] = useState<QuotationItemRecord[]>(
    [],
  );
  const isPDFGenerated =
    quotation.additionalInfo.pdfGenerationStatus === PdfGenerationStatus.DONE;

  const initialValues: CreateQuotation = {
    subject: '',
    description: '',
    elevatorId: '',
    moreInfo: '',
    items: [],
    serviceCompanyId: '',
  };

  const validationSchema = Yup.object().shape({
    subject: Yup.string().required('Subject is required'),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      if (!values.description.length) values.description = ' ';
      if (!values.moreInfo.length) values.moreInfo = ' ';

      updateQuotation(
        {
          data: values as UpdateQuotation,
          quotationId: quotation.id,
        },
        {
          onSuccess: () => setIsSendEmailDialogOpen(false),
        },
      );
    },
  });

  const handleSelectCustomer = (row: PropertyOwnerView) => {
    setCustomer(row);
  };

  const handleSelectUnit = (row: ElevatorView) => {
    setUnit(row);
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
    setQuotationItems(
      quotation.items.map(
        (i): QuotationItemRecord => ({
          articleId: i.article.id,
          description: i.description || i.article.description,
          name: i.name || i.article.name,
          articleUnit: i.article.unit,
          quantity: i.quantity,
          unitAmount: i.unitAmount,
        }),
      ),
    );
    setUnit(quotation.elevator);
    formik.setFieldValue('subject', quotation.subject, true);
    formik.setFieldValue('description', quotation.description, true);
    formik.setFieldValue('moreInfo', quotation.moreInfo, true);
  }, [quotation]);

  useEffect(() => {
    if (unit) {
      setCustomer(unit.propertyOwner);
      formik.setFieldValue('elevatorId', unit.id, true);
    }
  }, [unit]);

  useEffect(() => {
    formik.setFieldValue(
      'items',
      quotationItems.map(
        (item): WithOptional<QuotationItemRecord, 'articleUnit'> => ({
          articleId: item.articleId,
          description: item.description,
          name: item.name,
          quantity: item.quantity,
          unitAmount: item.unitAmount,
        }),
      ),
      true,
    );
  }, [quotationItems]);

  const actions = useMemo(() => {
    const items = [
      {
        label: t('Save & Send'),
        icon: <Send />,
        onClick: () => {
          setIsSendEmailDialogOpen(true);
        },
      },
      {
        label: t('Delete'),
        icon: <DeleteIcon />,
        onClick: () => {
          setIsDeleteDialogOpen(true);
        },
      },
    ];
    return items;
  }, []);

  return (
    <Box>
      <Box display="flex" alignItems="flex-end" justifyContent="space-between">
        <StatusChip
          label={getQuotationStatusStyles(quotation.status).label}
          color={getQuotationStatusStyles(quotation.status).color}
          size="small"
          variant="filled"
        />
        <Notes quotation={quotation!} />
      </Box>
      <A4Layout placeholder="Quotation" number={quotation.number}>
        <Box display="flex" mt="1em" gap="2em">
          <Box flexGrow={1} display="flex" flexDirection="column" gap="2em">
            <SelectCombined
              selected={customer !== null}
              label="Customer Details"
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
                setCustomer(null);
                setUnit(null);
              }}
              modalHeader="Select Customer"
              modalBody={
                <CustomersDataGrid setRowItem={handleSelectCustomer} />
              }
              labelRequired
            />
            <SelectCombined
              selected={unit !== null}
              label="Unit Details"
              buttonText="Select Unit"
              cardHeader={
                unit && <Typography variant="body2">{unit.model}</Typography>
              }
              cardBody={
                unit && (
                  <Typography variant="caption">
                    {unit.address.fullName}
                  </Typography>
                )
              }
              cardOnClose={() => {
                setUnit(null);
              }}
              modalHeader="Select Unit"
              modalBody={
                <UnitsDataGrid
                  setRowItem={handleSelectUnit}
                  searchCustomer={customer?.name}
                />
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
            {[
              {
                label: 'Date Created',
                value: formatDate(
                  quotation ? quotation.meta.createdAt : new Date(),
                ),
              },
              {
                label: 'Created By',
                value: quotation
                  ? `${quotation.meta.creator?.firstName} ${quotation.meta.creator?.lastName}`
                  : `${user?.userAccount.firstName} ${user?.userAccount.lastName}`,
              },
            ].map((i) => (
              <Box key={i.label}>
                <FormLabel text={i.label} />
                <Typography>{i.value}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
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
          items={useMemo(() => quotationItems, [quotationItems])}
          setItems={setQuotationItems}
        />

        <Box my="1.5em">
          <FormLabel text="Additional Information" />
          <FormInput
            props={{
              id: 'moreInfo',
              value: formik.values.moreInfo,
              onChange: formik.handleChange,
              minRows: 2,
              maxRows: 4,
              multiline: true,
              fullWidth: true,
            }}
          />
        </Box>
      </A4Layout>

      <BottomDrawer
        isOpen
        primaryButtonLabel={t('Save')}
        primaryButtonAction={formik.handleSubmit}
        listItems={actions.map((item) => ({
          ...item,
          showBorder: actions[actions.length - 1] !== item,
        }))}
        isValid={
          !!(
            formik.values.subject &&
            formik.values.elevatorId &&
            formik.values.items.length &&
            unit !== null
          )
        }
      />

      <SendEmailDialog
        open={isSendEmailDialogOpen}
        onConfirm={formik.handleSubmit}
        onClose={() => setIsSendEmailDialogOpen(false)}
        id={quotation.id}
        submitHook={usePublishQuotation}
        confirmBtnDisabled={!isPDFGenerated}
        subject={quotation.subject}
        content={quotation.description}
      />
      <Confirm
        open={isDeleteDialogOpen}
        onConfirm={() => {
          if (quotation.id)
            deleteQuotation({
              quotationId: quotation.id,
              shouldNavigate: true,
            });
          setIsDeleteDialogOpen(false);
        }}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Delete Quotation"
        content="Do you want to delete this Quotation?"
        helperText="This action is irreversible."
      />
    </Box>
  );
};
