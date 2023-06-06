import {useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Box, Typography} from '@mui/material';
import {GridRowsProp} from '@mui/x-data-grid';
import * as Yup from 'yup';
import {useFormik} from 'formik';

import {DataGridLayout} from 'components/DataGridLayout';
import {Dialog} from 'components/Dialog';
import {InfoCard} from 'components/InfoCard';
import {
  useContacts,
  useCreateContact,
  useDeleteContact,
  useUpdateContact,
} from 'hooks/reactQuery/useContacts';
import {ContactsView, ContactFormModel} from 'models/contacts';
import {phoneValidationRE} from 'pages/NewEmployee/BasicEmployeeForm';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {EmptySection} from 'components/EmptySection';
import {convertToMacro} from 'utils/utils';
import {Confirm} from 'components/Confirm';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {formatPhoneNumber} from 'utils/customer-utils';
import {columns, makeRows} from './ContactsWidgetDataGridProps';
import {EditContactForm} from './EditContactForm';

interface Props {
  customerId: string;
}

const validationSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string()
    .email('Enter a valid email')
    .required('Email is required'),
  phone: Yup.string().matches(phoneValidationRE, 'Phone number is not valid'),
  roles: Yup.string().required('Role is required'),
});

export const ContactsWidget = ({customerId}: Props) => {
  const {t} = useTranslation();
  const {user} = useUserSession();
  const [page, setPage] = useState(makePage(0, 5));
  const [pageCount, setPageCount] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [openCancelConfirm, setOpenCancelConfirm] = useState(false);

  const [rows, setRows] = useState<GridRowsProp>([]);

  const [activeContact, setActiveContact] = useState<ContactsView | undefined>(
    undefined,
  );
  const [typeAction, setTypeAction] = useState<'edit' | 'create' | undefined>(
    undefined,
  );

  const {mutateAsync: updateContact} = useUpdateContact(
    'Contact updated successfully',
  );

  const {mutateAsync: createContact} = useCreateContact(
    'Contact added successfully',
  );

  const {mutateAsync: deleteContact} = useDeleteContact(
    'Contact deleted successfully',
  );

  const formik = useFormik<ContactFormModel>({
    initialValues: {
      phone: '',
      secondaryPhone: '',
      firstName: '',
      lastName: '',
      email: '',
      roles: '',
    },
    onSubmit: (values, {resetForm}) => {
      resetForm();
    },
    validationSchema,
  });

  const {data: contactsResource = createEmptyResource<ContactsView>(5)} =
    useContacts(page, customerId || '');

  useEffect(() => {
    setRows(makeRows(contactsResource));
    setPageCount(Math.ceil(contactsResource.total / page.pageSize));
  }, [contactsResource, page.pageSize]);

  const getEditableContacts = (item: ContactsView) => {
    formik.setValues({
      phone: item?.userAccount.contact.phone.replace(/[^\d]/g, '') || '',
      secondaryPhone:
        item?.additionalInfo?.secondaryPhone?.replace(/[^\d]/g, '') ?? '',
      firstName: item?.userAccount.firstName || '',
      lastName: item?.userAccount.lastName || '',
      email: item?.userAccount.contact.email || '',
      roles: item?.userAccount.roles[0] || '',
    });

    setActiveContact(item);
    setOpenDialog(true);
    setTypeAction('edit');
  };

  const onCreateContact = () => {
    formik.setValues({
      phone: '',
      secondaryPhone: '',
      firstName: '',
      lastName: '',
      email: '',
      roles: '',
    });

    setActiveContact(undefined);
    setOpenDialog(true);
    setTypeAction('create');
    formik.resetForm();
  };

  const getDeletableContacts = (item: ContactsView) => {
    setActiveContact(item);
    setOpenCancelConfirm(true);
  };

  const updateCurrentContact = async () => {
    await updateContact({
      body: {
        propertyContactPerson: {
          externalId: customerId,
          roles: [convertToMacro(formik.values.roles)],
          secondaryPhone: formik.values.secondaryPhone
            ? formatPhoneNumber(formik.values.secondaryPhone)
            : '',
        },
        userAccount: {
          category: activeContact?.userAccount.category || '',
          contact: {
            email: formik.values.email,
            phone: formik.values.phone
              ? formatPhoneNumber(formik.values.phone)
              : '',
          },
          firstName: formik.values.firstName,
          lastName: formik.values.lastName,
          photoUrl: activeContact?.userAccount.photoUrl || '',
          title: activeContact?.userAccount.title || '',
          username: activeContact?.userAccount.username || '',
        },
      },
      contactId: activeContact?.id || '',
    });

    setOpenDialog(false);
  };

  const saveNewContact = async () => {
    await createContact({
      body: {
        propertyContactPerson: {
          externalId: customerId,
          roles: [convertToMacro(formik.values.roles)],
          propertyOwnerId: customerId,
          secondaryPhone: formik.values.secondaryPhone
            ? formatPhoneNumber(formik.values.secondaryPhone)
            : '',
        },
        userAccount: {
          category: '',
          contact: {
            email: formik.values.email,
            phone: formik.values.phone
              ? formatPhoneNumber(formik.values.phone)
              : '',
          },
          firstName: formik.values.firstName,
          lastName: formik.values.lastName,
          photoUrl: '',
          title: '',
          username: formik.values.email,
          serviceCompanyId: user?.userAccount.serviceCompany.id || '',
        },
      },
    });
    setOpenDialog(false);
  };

  const onDelete = async () => {
    await deleteContact({
      contactId: activeContact?.id || '',
    });

    setOpenCancelConfirm(false);
  };

  return (
    <Box>
      <InfoCard
        header={
          <Typography variant="subtitle1">{t('Contact Persons')}</Typography>
        }
        containerStyles={{flexGrow: 1}}
        headerStyles={{mt: '0.5em'}}
        handleAction={onCreateContact}
        headerActionIcon={
          <Typography color="info.main">{t('+ Add')}</Typography>
        }
        showHeaderBackground>
        <DataGridLayout
          fullHeight={false}
          isCellClickable={false}
          height={400}
          rows={rows}
          columns={useCallback(
            () => columns(getEditableContacts, getDeletableContacts),
            [],
          )()}
          noRowsEmptySection={
            <EmptySection
              illustration="clipboard"
              size="tiny"
              containerStyle={{my: 'auto'}}
              label="No contact persons yet. They will appear here once added!"
            />
          }
          isWidget
          containerStyle={{
            borderBottom: 'none',
          }}
          hideFooter={pageCount <= 1}
          pageIndex={page.pageIndex + 1}
          pageSize={page.pageSize}
          handlePageSizeChange={(newPageSize: number) =>
            setPage({...page, pageSize: newPageSize})
          }
          handlePageChange={(newPage: number) => {
            setPage({...page, pageIndex: newPage - 1});
          }}
          pageCount={pageCount}
          totalRows={contactsResource.total}
        />
      </InfoCard>
      <Dialog
        title={
          typeAction === 'edit' ? 'Edit Contact Person' : 'Add Contact Person'
        }
        disableSaveBtn={!!Object.keys(formik.errors).length}
        onCancel={() => setOpenDialog(false)}
        onSave={typeAction === 'edit' ? updateCurrentContact : saveNewContact}
        dialogProps={{
          maxWidth: 'md',
          open: openDialog || false,
        }}>
        <EditContactForm formik={formik} />
      </Dialog>
      <Confirm
        open={openCancelConfirm}
        onConfirm={() => onDelete()}
        onClose={() => setOpenCancelConfirm(false)}
        title="Delete"
        content={`Do you want to delete ${activeContact?.userAccount.firstName} ${activeContact?.userAccount.lastName} from the contact persons list?`}
      />
    </Box>
  );
};
