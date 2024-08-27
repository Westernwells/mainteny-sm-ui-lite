import {DataGridLayout} from 'components/DataGridLayout';
import {PageListingLayout} from 'components/PageListingLayout';
import {Widget} from 'components/Widget';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {createEmptyResource, makePage} from 'utils/paging';
import {
  ServiceCompanyContactPersonOrderField,
  ServiceCompanyContactPersonView,
} from 'models/contacts';
import {
  useDeleteServiceCompanyContactPerson,
  useServiceCompanyContactPersons,
} from 'hooks/reactQuery/useContacts';
import {GridRowsProp} from '@mui/x-data-grid';
import {EmptySection} from 'components/EmptySection';
import {Progress} from 'components/Progress';
import {Confirm} from 'components/Confirm';
import {useSearchValues} from 'hooks/useSearchValues';
import {Order, OrderByParams} from 'models/misc';
import {getColumns, makeRows} from './ContactsTable/ContactsDataGridProps';
import ContactDetails from './ContactDetails';
import ContactFormDialog from './ContactFormDialog';

const PAGE_SIZE = 25;

const Contacts = () => {
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [formType, setFormType] = useState<'create' | 'edit'>('create');
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [page, setPage] = useState(makePage(0, PAGE_SIZE));
  const [pageCount, setPageCount] = useState(0);
  const totalContractRef = useRef(0);
  const [showSideDrawer, setShowSideDrawer] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const [selectedContact, setSelectedContact] =
    useState<ServiceCompanyContactPersonView>();
  const {values} =
    useSearchValues<OrderByParams<ServiceCompanyContactPersonOrderField>>();
  const {sortOrder, orderByField} = values;

  const {mutate: deleteContact, isLoading: isDeleting} =
    useDeleteServiceCompanyContactPerson('Contact person deleted successfully');

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
      pageIndex: search.length ? 0 : page.pageIndex,
      query: search,
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

  const resetForm = () => {
    setSelectedContact(undefined);
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

  const handleShowDetails = useCallback(
    (id: string) => {
      setSelectedContact(contactsResource.data.find((el) => el.id === id));
      setShowSideDrawer(true);
    },
    [contactsResource],
  );

  const columns = useMemo(
    () =>
      getColumns({
        onDelete: handleDeleteContact,
        onEdit: handleEditContact,
        onSendEmail: handleSendEmail,
        onShowDetails: handleShowDetails,
      }),
    [handleDeleteContact, handleEditContact, handleShowDetails],
  );

  if (isIdle || isLoading) {
    return <Progress />;
  }

  return (
    <>
      <ContactDetails
        showSideDrawer={showSideDrawer}
        setShowSideDrawer={setShowSideDrawer}
        contactPerson={contactsResource.data.find(
          (el) => el.id === selectedContact?.id,
        )}
      />
      <ContactFormDialog
        contactPerson={selectedContact}
        formType={formType}
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
      />
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
            onRowClick={({row}, event) => {
              event.stopPropagation();
              handleShowDetails(row.id);
            }}
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
