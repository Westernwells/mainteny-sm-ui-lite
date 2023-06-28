/* eslint-disable @typescript-eslint/no-use-before-define */
import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';
import * as Yup from 'yup';
import {useFormik} from 'formik';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import DraftsIcon from '@mui/icons-material/Drafts';
import DeleteIcon from '@mui/icons-material/Delete';
import {A4Layout} from 'components/A4Layout';
import {SelectCombined} from 'components/SelectCombined';
import {ArticleItemsTable} from 'components/ArticleItemsTable';
import {CustomersDataGrid} from 'components/DataGrid/CustomersDataGrid';
import {UnitsDataGrid} from 'components/DataGrid/UnitsDataGrid';
import {BottomDrawer} from 'components/BottomDrawer';
import {FormLabel} from 'components/form/FormLabel';
import {FormInput} from 'components/form/FormInput';
import {SendEmailDialog} from 'components/SendEmailDialog';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {
  useCreateQuotation,
  usePublishQuotation,
} from 'hooks/reactQuery/useQuotation';
import {CreateQuotation, QuotationItemRecord} from 'models/quotation';
import {ElevatorView} from 'models/elevator';
import {
  PropertyOwnerSimpleView,
  PropertyOwnerView,
} from 'models/propertyManager';
import {WithOptional} from 'models/misc';

export const DraftQuotation = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();

  const {user} = useUserSession();

  const {mutateAsync: createNewQuotation, isLoading: isCreating} =
    useCreateQuotation();
  const {mutateAsync: publishQuotation, isLoading: publishingQuotation} =
    usePublishQuotation();

  const [isDrawerOpen] = useState<boolean>(true);
  const [isSendEmailDialogOpen, setIsSendEmailDialogOpen] = useState(false);

  const [customer, setCustomer] = useState<
    PropertyOwnerView | PropertyOwnerSimpleView | null
  >(null);
  const [unit, setUnit] = useState<ElevatorView | null>(null);
  const [quotationItems, setQuotationItems] = useState<QuotationItemRecord[]>(
    [],
  );

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
    onSubmit: async (values) => {
      const response = await save(values);
      navigate(`/quotations/details/${response.value}`);
    },
  });

  async function save(values: CreateQuotation) {
    if (!values.description.length) values.description = ' ';
    if (!values.moreInfo.length) values.moreInfo = ' ';

    return createNewQuotation({data: values});
  }

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

  const isValid = () => {
    const valid =
      formik.values.subject &&
      formik.values.elevatorId &&
      formik.values.items.length &&
      unit !== null;

    return !!valid;
  };

  return (
    <Box>
      <A4Layout placeholder="Quotation">
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
                      {customer.postalAddress?.fullName ?? '-'}
                    </Typography>
                    <Typography variant="caption" component="p">
                      {customer.contact.phone}
                    </Typography>
                    <Typography variant="subtitle2" component="p">
                      {t('Customer Number')}
                    </Typography>
                    <Typography variant="caption" component="p">
                      {customer.externalId || '-'}
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
              buttonText="Select unit"
              cardHeader={
                unit && <Typography variant="body2">{unit.model}</Typography>
              }
              cardBody={
                unit && (
                  <>
                    <Typography variant="caption">
                      {unit.address.fullName}
                    </Typography>
                    <Typography variant="subtitle2" component="p">
                      {t('Unit Number')}
                    </Typography>
                    <Typography variant="caption" component="p">
                      {unit.externalId || '-'}
                    </Typography>
                  </>
                )
              }
              cardOnClose={() => {
                setUnit(null);
              }}
              modalHeader="Select unit"
              modalBody={
                <UnitsDataGrid
                  setRowItem={handleSelectUnit}
                  searchCustomer={customer?.name}
                />
              }
              labelRequired
            />
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
          items={quotationItems}
          setItems={setQuotationItems}
          propertyOwnerId={customer?.id ?? ''}
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
        isOpen={isDrawerOpen}
        isSaving={isCreating}
        primaryButtonLabel={t('Save')}
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
        confirmBtnDisabled={publishingQuotation || isCreating}
        email={customer?.additionalInfo.billingEmail || customer?.contact.email}
        subject={formik.values.subject}
        content={formik.values.description}
        callback={async (emailRecord) => {
          const response = await save(formik.values);
          setIsSendEmailDialogOpen(false);
          await publishQuotation({
            id: response.value,
            body: {
              email: emailRecord.email,
              subject: emailRecord.subject,
              content: emailRecord.content,
            },
          });
        }}
      />
    </Box>
  );
};

export default DraftQuotation;
