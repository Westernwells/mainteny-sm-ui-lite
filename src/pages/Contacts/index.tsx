import {DataGridLayout} from 'components/DataGridLayout';
import {PageListingLayout} from 'components/PageListingLayout';
import {Widget} from 'components/Widget';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {
  ServiceCompanyContactPeronFormModel,
  ServiceCompanyContactPersonOrderField,
  ServiceCompanyContactPersonRole,
  ServiceCompanyContactPersonView,
} from 'models/contacts';
import {
  useCreateServiceCompanyContactPerson,
  useDeleteServiceCompanyContactPerson,
  useServiceCompanyContactPersons,
  useUpdateServiceCompanyContactPerson,
} from 'hooks/reactQuery/useContacts';
import {GridRowsProp} from '@mui/x-data-grid';
import {EmptySection} from 'components/EmptySection';
import {Progress} from 'components/Progress';
import {Dialog} from 'components/Dialog';
import {useForm} from 'react-hook-form';
import {Confirm} from 'components/Confirm';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {useUploadFiles} from 'hooks/reactQuery/useUploadSignedUrl';
import {useUuid} from 'hooks/reactQuery/useUuid';
import {FileWithPreview} from 'components/MyDropZone/MyDropzone';
import {useSearchValues} from 'hooks/useSearchValues';
import {Order, OrderByParams} from 'models/misc';
import ContactForm from './ContactForm';
import {getColumns, makeRows} from './ContactsTable/ContactsDataGridProps';

const PAGE_SIZE = 25;

const getDefaultValues = (
  contactPerson: ServiceCompanyContactPersonView | undefined,
  serviceCompanyId: string,
): ServiceCompanyContactPeronFormModel => ({
  contactPerson: {
    roles:
      (contactPerson?.userAccount
        .roles as unknown as ServiceCompanyContactPersonRole[]) || [],
    companyName: contactPerson?.companyName || '',
    secondaryPhone: contactPerson?.additionalInfo?.secondaryPhone || '',
    contactPersonId: contactPerson?.id || '',
  },
  userAccount: {
    firstName: contactPerson?.userAccount?.firstName || '',
    lastName: contactPerson?.userAccount?.lastName || '',
    photoUrl: contactPerson?.userAccount?.photoUrl || '',
    contact: {
      email: contactPerson?.userAccount?.contact.email || '',
      phone: contactPerson?.userAccount?.contact.phone || '',
    },
    serviceCompanyId,
    title: contactPerson?.userAccount?.title || '',
  },
});

const Contacts = () => {
  const {user} = useUserSession();
  const {data: uuid} = useUuid();
  const serviceCompanyId = user?.userAccount.serviceCompany.id || '';

  const {mutateAsync: uploadImages, isLoading: isUploading} = useUploadFiles(
    'Image uploaded successfully',
  );

  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [formType, setFormType] = useState<'create' | 'edit'>('create');
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [page, setPage] = useState(makePage(0, PAGE_SIZE));
  const [pageCount, setPageCount] = useState(0);
  const totalContractRef = useRef(0);
  const [selectedContact, setSelectedContact] =
    useState<ServiceCompanyContactPersonView>();
  const {values} =
    useSearchValues<OrderByParams<ServiceCompanyContactPersonOrderField>>();
  const {sortOrder, orderByField} = values;

  const uploadPath = `${serviceCompanyId}/contactPersons/${
    formType === 'edit' ? selectedContact?.id : uuid
  }`;

  const {mutate: deleteContact, isLoading: isDeleting} =
    useDeleteServiceCompanyContactPerson('Contact person deleted successfully');
  const {mutate: createContact, isLoading: isCreating} =
    useCreateServiceCompanyContactPerson('Contact person created successfully');
  const {mutate: updateContact, isLoading: isUpdating} =
    useUpdateServiceCompanyContactPerson('Contact person updated successfully');

  const {
    data: contactsResource = createEmptyResource<ServiceCompanyContactPersonView>(
      10,
    ),
    isLoading,
    isIdle,
    isFetched,
    isFetching,
  } = useServiceCompanyContactPersons(
    {
      pageSize: PAGE_SIZE,
      pageIndex: page.pageIndex,
      query: search,
      role: [...Object.values(ServiceCompanyContactPersonRole)],
      order: sortOrder || Order.DESC,
      orderBy:
        orderByField || ServiceCompanyContactPersonOrderField.CREATED_DATE,
    },
    {
      keepPreviousData: true,
    },
  );
  totalContractRef.current = totalContractRef.current || contactsResource.total;

  useEffect(() => {
    setPageCount(Math.ceil(contactsResource.total / page.pageSize));
  }, [contactsResource, page.pageSize]);

  useEffect(() => {
    if (!isFetching) {
      setRows(makeRows(contactsResource));
    }
  }, [contactsResource, isFetching]);

  const useHookForm = useForm<ServiceCompanyContactPeronFormModel>({
    defaultValues: getDefaultValues(selectedContact, serviceCompanyId),
    mode: 'onChange',
  });
  const {handleSubmit, formState, reset} = useHookForm;

  const resetForm = () => {
    setSelectedContact(undefined);
    reset(getDefaultValues(undefined, serviceCompanyId));
  };

  const handleContactFormSubmit = async (
    data: ServiceCompanyContactPeronFormModel,
  ) => {
    const file = data.userAccount.photoUrl?.[0] as unknown as FileWithPreview;
    const photoUrl = `${uploadPath}/${file?.name}`;

    // If file type is File object, upload it
    if (!!file && typeof file !== 'string') {
      await uploadImages({
        files: [file] || [],
        uploadPath,
      });
    }

    if (formType === 'create') {
      await createContact({
        contactPerson: {
          ...data.contactPerson,
          roles: [
            data.contactPerson
              .roles as unknown as ServiceCompanyContactPersonRole,
          ],
          contactPersonId: uuid,
        },
        userAccount: {
          ...data.userAccount,
          photoUrl,
          serviceCompanyId,
        },
      });
    } else {
      await updateContact({
        body: {
          contactPerson: {
            ...data.contactPerson,
            roles: Array.isArray(data.contactPerson.roles)
              ? data.contactPerson.roles
              : [
                  data.contactPerson
                    .roles as unknown as ServiceCompanyContactPersonRole,
                ],
          },
          userAccount: {
            ...data.userAccount,
            photoUrl:
              typeof data.userAccount.photoUrl === 'string'
                ? data.userAccount.photoUrl
                : photoUrl,
            serviceCompanyId,
          },
        },
        contactPersonId: selectedContact?.id || '',
      });
    }

    setOpenDialog(false);
    resetForm();
  };

  const handleDeleteConfirm = async (id: string) => {
    await deleteContact(id);
    setOpenDeleteConfirm(false);
    resetForm();
  };

  const handleAddContact = async () => {
    setFormType('create');
    resetForm();
    setOpenDialog(true);
  };

  const handleEditContact = useCallback(
    (id: string) => {
      setFormType('edit');
      setOpenDialog(true);
      const contact = contactsResource.data.find((el) => el.id === id);
      reset(getDefaultValues(contact, serviceCompanyId));
      setSelectedContact(contact);
    },
    [contactsResource],
  );

  const handleDeleteContact = useCallback(
    (id: string) => {
      setSelectedContact(contactsResource.data.find((el) => el.id === id));
      setOpenDeleteConfirm(true);
    },
    [contactsResource],
  );

  const handleSendEmail = useCallback(
    (id: string) => {
      const contact = contactsResource.data.find((el) => el.id === id);
      window.location.href = `mailto:${contact?.userAccount?.contact?.email}`;
    },
    [contactsResource],
  );

  const handleShowDetails = useCallback((id: string) => {
    console.log('handleShowDetails', id);
  }, []);

  const columns = useMemo(
    () =>
      getColumns({
        onDelete: handleDeleteContact,
        onEdit: handleEditContact,
        onSendEmail: handleSendEmail,
        onShowDetails: handleShowDetails,
      }),
    [handleDeleteContact, handleEditContact],
  );

  if (isIdle || isLoading) {
    return <Progress />;
  }

  return (
    <>
      <Dialog
        title={formType === 'edit' ? 'Edit Contact' : 'Add Contact'}
        saveButtonText="Confirm"
        disableSaveBtn={
          isCreating || isUploading || isUpdating || !formState.isValid
        }
        isSaving={isCreating}
        onCancel={() => {
          setOpenDialog(false);
          resetForm();
        }}
        onSave={handleSubmit(handleContactFormSubmit)}
        dialogProps={{
          maxWidth: 'sm',
          open: openDialog,
        }}>
        <ContactForm
          form={useHookForm}
          initialValues={getDefaultValues(selectedContact, serviceCompanyId)}
        />
      </Dialog>
      {isFetched && contactsResource.total === 0 && !search ? (
        <EmptySection
          showActionBtn
          size="tiny"
          btnSize="medium"
          illustration="clipboard"
          label="No contact yet."
          subLabel="Please add by clicking the button below!"
          subLabelProps={{
            sx: {
              typography: 'subtitle2',
              color: 'text.secondary',
            },
          }}
          btnLabel="Contact"
          containerStyle={{
            height: '100%',
            mb: '10em',
          }}
          btnAction={() => handleAddContact()}
        />
      ) : (
        <PageListingLayout
          renderWidget={
            contactsResource.total !== 0 || !!search ? (
              <Widget
                showActionBtn
                searchPlaceholder="Search by name, role, address etc."
                getSearchValue={(val: string) => setSearch(val)}
                btnOnClick={handleAddContact}
                btnLabel="Contact"
                defaultSearchValue={search}
              />
            ) : undefined
          }>
          <DataGridLayout
            rows={rows}
            columns={columns}
            isCellClickable={false}
            scrollToTop={search}
            loading={isFetching}
            pageSize={page.pageSize}
            pageIndex={page.pageIndex + 1}
            handlePageSizeChange={(newPageSize: number) =>
              setPage({
                ...page,
                pageSize: newPageSize,
              })
            }
            handlePageChange={(newPage: number) =>
              setPage({
                ...page,
                pageIndex: newPage - 1,
              })
            }
            pageCount={pageCount}
            totalRows={contactsResource?.total}
          />
          <Confirm
            maxWidth={400}
            disableActions={isDeleting}
            open={openDeleteConfirm}
            onConfirm={async () => {
              await handleDeleteConfirm(selectedContact?.id || '');
              setOpenDeleteConfirm(false);
            }}
            onClose={() => setOpenDeleteConfirm(false)}
            title="Delete contact person"
            content="You are about to delete this contact person. Are you sure about it?"
          />
        </PageListingLayout>
      )}
    </>
  );
};

export default Contacts;
