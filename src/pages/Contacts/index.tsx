import React, {useCallback, useMemo, useRef, useState} from 'react';
import {createEmptyResource, makePage, toggleOrder} from 'utils/paging';
import {
  ContactTableRow,
  CONTRACT_ROLE_FILTER,
  ServiceCompanyContactPersonOrderField,
  ServiceCompanyContactPersonQueryParams,
  ServiceCompanyContactPersonRole,
  ServiceCompanyContactPersonView,
} from 'models/contacts';
import {
  useAllContactPersons,
  useContactPersonComments,
  useContactStatistics,
  useServiceCompanyContactPersons,
} from 'hooks/reactQuery/useContacts';
import {Progress} from 'components/Progress';
import {useSearchValues} from 'hooks/useSearchValues';
import {Order, OrderByParams} from 'models/pagination';
import PageHeaderContainer from 'components/PageHeaderContainer';
import Box from '@mui/material/Box';
import SearchInput from 'components/SearchInput/index';
import {CircularProgress} from '@mui/material';
import {Button} from 'components/Button';
import AddButton from 'components/AddButton';
import QuickFilter from 'components/QuickFilter';
import TableContainer from 'components/Table/TableContainer';
import TableHeader from 'components/Table/TableHeader';
import TableBody from 'components/Table/TableBody';
import TableRow from 'components/Table/TableRow';
import Pagination from 'components/Pagination';
import PageContainer from 'components/PageContainer';
import {useQueryState} from 'hooks/useQueryState';
import {useTranslation} from 'react-i18next';
import EmptyTable from 'components/Table/EmptyTable';
import {aggregateContactRow} from 'utils/contact';
import ContactFormDialog from 'pages/Contacts/ContactFormDialog';
import {
  ACTION_CELL_WIDTH,
  NOTES_CELL_WIDTH,
  TableColumnWithRender,
} from 'models/table';
import Cell from 'components/Table/TableCell';
import TableCellText from 'components/Table/TableCellText';
import {Avatar} from 'components/Avatar';
import {theme} from 'theme';
import {formatDate} from 'utils/datetime';
import NoteIcon from 'components/NoteIcon';
import Actions from 'pages/Contacts/ContactsTable/Actions';
import {OptionWithTranslationKey} from 'models/filter';
import {
  createQuickFilterOptions,
  filterOutQuickFilterOptions,
} from 'utils/filter';
import {convertToText} from 'utils/utils';
import {reduce} from 'lodash';
import {mapStatusToFilterOptions} from 'utils/quotation';
import {QUOTATION_STATUS_FILTER, QuotationStatus} from 'models/quotation';
import {useExportTableSheet} from 'hooks/useExport';
import ContactDetails from 'pages/Contacts/ContactDetails';

const PAGE_SIZE = 25;

const QUICK_FILTER_OPTIONS: OptionWithTranslationKey[] =
  createQuickFilterOptions(CONTRACT_ROLE_FILTER);

const Contacts = () => {
  const {t} = useTranslation();

  const [search, setSearch] = useState('');
  const [page, setPage] = useQueryState('page', {
    defaultValue: makePage(0, PAGE_SIZE),
  });

  const totalContractRef = useRef(0);
  const textInput = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [formType, setFormType] = useState<'create' | 'edit'>('create');

  const [selectedContactRole, setSelectedContactRole] = useQueryState<
    CONTRACT_ROLE_FILTER[]
  >('selectedContactRole', {defaultValue: []});

  const [selectedContact, setSelectedContact] =
    useState<ServiceCompanyContactPersonView>();

  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);

  const [hoverNoteId, setHoverNoteId] = useState<string | undefined>();

  const [showSideDrawer, setShowSideDrawer] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const {
    values: {sortOrder, orderByField},
    updateValues,
  } = useSearchValues<OrderByParams<ServiceCompanyContactPersonOrderField>>();

  const filters: ServiceCompanyContactPersonQueryParams = {
    pageIndex: page.pageIndex,
    pageSize: page.pageSize,
    ...(search && {query: search}),
    orderBy: orderByField || ServiceCompanyContactPersonOrderField.CREATED_DATE,
    order: sortOrder || Order.DESC,
    role: selectedContactRole.includes(CONTRACT_ROLE_FILTER.ALL)
      ? []
      : (selectedContactRole as unknown as ServiceCompanyContactPersonRole[]),
  };

  const {
    data: contactsResource = createEmptyResource<ServiceCompanyContactPersonView>(
      10,
    ),
    isLoading,
    isIdle,
    isFetched,
  } = useServiceCompanyContactPersons(filters, {
    keepPreviousData: true,
  });
  totalContractRef.current = totalContractRef.current || contactsResource.total;

  const {data: contactStatistics} = useContactStatistics(filters, {
    keepPreviousData: true,
  });

  const {data: notes} = useContactPersonComments(
    hoverNoteId ?? '',
    {
      pageIndex: 0,
      pageSize: 1,
    },
    {
      enabled: !!hoverNoteId,
    },
  );

  const {refetch: refetchAllContacts, isFetching: isFetchingAllContacts} =
    useAllContactPersons(filters, {
      enabled: false,
      refetchOnWindowFocus: false,
    });

  const rows = useMemo(
    () => aggregateContactRow(contactsResource.data),
    [contactsResource],
  );

  const aggregatedContactStatistics = useMemo(() => {
    if (!contactStatistics) return undefined;

    return reduce(
      contactStatistics.numOfContactPersonsPerRole,
      (acc: Record<string, number>, amount, currentStatus) => {
        const statusToUpdate = mapStatusToFilterOptions(
          currentStatus as QuotationStatus,
        );
        acc[statusToUpdate] = (acc[statusToUpdate] ?? 0) + amount;
        acc[QUOTATION_STATUS_FILTER.ALL] =
          (acc[QUOTATION_STATUS_FILTER.ALL] ?? 0) + amount;
        return acc;
      },
      {},
    );
  }, [contactStatistics]);

  const fetchedNote = useMemo(() => notes?.data[0], [notes]);

  const handleNoteHover = (serviceOrderId: string | undefined) => () => {
    setHoverNoteId(serviceOrderId);
  };

  const handleQuickFilterChange = (value: string) => {
    // when selecting ALL values remove all other selections
    if (value === 'ALL') {
      setSelectedContactRole(
        selectedContactRole.length === 1 &&
          selectedContactRole[0] === CONTRACT_ROLE_FILTER.ALL
          ? []
          : [CONTRACT_ROLE_FILTER.ALL],
      );
      return;
    }

    const newValues = selectedContactRole.some((option) => option === value)
      ? selectedContactRole.filter((option) => option !== value)
      : [...selectedContactRole, value];

    // remove the ALL status if any other status is selected
    if (newValues.length > 1 && newValues.includes('ALL')) {
      setSelectedContactRole(
        newValues.filter(
          (selectedValues) => selectedValues !== 'ALL',
        ) as CONTRACT_ROLE_FILTER[],
      );
      return;
    }

    const areAllValuesSelectedIndividually = filterOutQuickFilterOptions({
      options: QUICK_FILTER_OPTIONS,
    }).every((option) =>
      newValues.some((selectedValue) => option.value === selectedValue),
    );

    setSelectedContactRole(
      areAllValuesSelectedIndividually
        ? [CONTRACT_ROLE_FILTER.ALL]
        : (newValues as CONTRACT_ROLE_FILTER[]),
    );
  };

  const resetForm = () => {
    setSelectedContact(undefined);
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
      resetForm();
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

  const handleAddContact = async () => {
    setFormType('create');
    resetForm();
    setOpenDialog(true);
  };

  const handleRowClick = (contact: ServiceCompanyContactPersonView) => () => {
    setSelectedContact(contact);
    setShowSideDrawer(true);
  };

  const COLUMNS = useMemo<TableColumnWithRender<ContactTableRow>[]>(
    () => [
      {
        headerName: 'Contact',
        key: 'contact-cell-contact',
        width: '212px',
        isFirst: true,
        fieldName: ServiceCompanyContactPersonOrderField.NAME,
        getExportValue: (contact) =>
          contact.userAccount.firstName
            ? contact.userAccount.lastName
            : `${contact.userAccount.firstName} ${contact.userAccount.lastName}`,
        showShadows: showRightShadow ? 'right' : undefined,
        renderCell: (contact, cellProps) => (
          <Cell {...cellProps}>
            <Avatar
              labelStyles={{
                color: theme.palette.primary.light,
              }}
              key={`contact-user-avatar-${contact.id}`}
              userAccount={contact.userAccount}
            />
          </Cell>
        ),
      },
      {
        headerName: 'Company',
        key: 'contact-cell-company',
        width: '212px',
        fieldName: ServiceCompanyContactPersonOrderField.COMPANY,
        getExportValue: (contact) => contact.companyName,
        renderCell: (contact, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>{contact.companyName ?? '-'}</TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'EMAIL',
        key: 'contact-cell-email-address',
        fieldName: ServiceCompanyContactPersonOrderField.EMAIL,
        getExportValue: (contact) => contact.email,
        renderCell: (contact, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>{contact.email ?? '-'}</TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'Phone 1',
        key: 'contact-cell-primary-phone',
        fieldName: ServiceCompanyContactPersonOrderField.PHONE,
        getExportValue: (contact) => contact.primaryPhone ?? '',
        renderCell: (contact, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>{contact.primaryPhone ?? '-'}</TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'Phone 2',
        key: 'contact-cell-secondary-phone',
        fieldName: ServiceCompanyContactPersonOrderField.SECONDARY_PHONE,
        getExportValue: (contact) => contact.secondaryPhone ?? '',
        renderCell: (contact, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>{contact.secondaryPhone ?? '-'}</TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'Role',
        key: 'contact-cell-role',
        width: '136px',
        fieldName: ServiceCompanyContactPersonOrderField.ROLE,
        getExportValue: (contact) =>
          contact.roles.map((role) => t(convertToText(role))).join(', ') ?? '',
        renderCell: (contact, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>
              {contact.roles.map((role) => t(convertToText(role)))}
            </TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'NOTES',
        key: 'contact-cell-notes',
        width: NOTES_CELL_WIDTH,
        align: 'center',
        noPadding: true,
        fieldName: ServiceCompanyContactPersonOrderField.COMMENT_COUNT,
        renderCell: (contact, cellProps) => (
          <Cell {...cellProps} fieldName="NOTES" noWidthLimit>
            <NoteIcon
              hasNotes={contact.hasComments}
              timeStamp={formatDate(fetchedNote?.meta.lastUpdatedAt)}
              noteContent={fetchedNote?.content}
              onMouseEnter={handleNoteHover(contact.id)}
              onMouseLeave={handleNoteHover(undefined)}
            />
          </Cell>
        ),
      },
      {
        headerName: 'action',
        key: 'contact-cell-action',
        isHeaderNameHidden: true,
        align: 'center',
        width: ACTION_CELL_WIDTH,
        isLast: true,
        showShadows: showLeftShadow ? 'left' : undefined,
        noPadding: true,
        renderCell: (contact, cellProps) => (
          <Cell {...cellProps} onClick={undefined}>
            <Actions
              contactId={contact.id}
              onDelete={handleDeleteContact}
              onEdit={handleEditContact}
              onShowDetails={handleShowDetails}
              onSendEmail={handleSendEmail}
            />
          </Cell>
        ),
      },
    ],
    [showLeftShadow, showRightShadow, fetchedNote],
  );

  const handlePageIndexChange = (value: number) => {
    setPage({...page, pageIndex: value});
    containerRef?.current?.scrollTo({top: 0, behavior: 'smooth'});
  };

  const handleChangeElementsPerPage = (value: number) => {
    setPage({...page, pageSize: value, pageIndex: 0});
    containerRef?.current?.scrollTo({top: 0, behavior: 'smooth'});
  };

  const {emptyTable, noMatchingData} = useMemo(() => {
    if (!isFetched) return {emptyTable: false, noMatchingData: false};

    if (
      (selectedContactRole.length > 0 || !!search) &&
      contactsResource.total === 0
    ) {
      return {emptyTable: false, noMatchingData: true};
    }

    // when the user does not have filters applied and there are no entries for the table
    if (contactsResource.total === 0) {
      return {emptyTable: true, noMatchingData: false};
    }

    return {emptyTable: false, noMatchingData: false};
  }, [isFetched, contactsResource]);

  const handleSortField = (fieldName: string) => {
    const order = toggleOrder(
      orderByField === fieldName ? sortOrder : undefined,
    );
    updateValues({
      orderByField: order
        ? (fieldName as ServiceCompanyContactPersonOrderField)
        : undefined,
      sortOrder: order,
    });
  };

  const handleExport = useExportTableSheet<
    ContactTableRow,
    ServiceCompanyContactPersonView
  >({
    excludedFields: ['contact-cell-notes', 'contact-cell-action'],
    refetchCallback: refetchAllContacts,
    columns: COLUMNS,
    aggregateCallback: aggregateContactRow,
    fileName: 'Contacts',
  });

  if (isIdle || isLoading) {
    return <Progress />;
  }

  return (
    <>
      {emptyTable && (
        <EmptyTable
          illustration="contacts"
          label="No contacts"
          subLabel="Add a new contact person and always have their information readily available for efficient communication."
          btnLabel="New Contact"
          onClick={handleAddContact}
        />
      )}

      {!emptyTable && (
        <PageContainer gap={3}>
          <PageHeaderContainer>
            <Box
              sx={{
                display: 'flex',
              }}
              gap={2}>
              <SearchInput
                refInput={textInput}
                defaultValue={search}
                onChange={(val: string) => setSearch(val)}
              />
            </Box>
            <Box display="flex" gap={2}>
              {rows.length > 0 && (
                <Button
                  buttonProps={{
                    size: 'medium',
                    variant: 'outlined',
                    color: 'primary',
                    onClick: handleExport,
                    disabled: isFetchingAllContacts,
                  }}
                  style={{
                    borderColor: 'text.primary',
                    height: '36px',
                    paddingTop: 0,
                  }}>
                  {isFetchingAllContacts ? (
                    <CircularProgress size="1rem" sx={{mr: 1}} />
                  ) : null}
                  <Box pt={0.5}>{t('Export')}</Box>
                </Button>
              )}
              <AddButton label="New Contact" onClick={handleAddContact} />
            </Box>
          </PageHeaderContainer>
          <Box>
            <QuickFilter
              selected={selectedContactRole ?? null}
              options={QUICK_FILTER_OPTIONS}
              statistics={aggregatedContactStatistics}
              onChange={handleQuickFilterChange}
            />
          </Box>
          <TableContainer
            showNoMatchWarning={noMatchingData}
            containerRef={containerRef}
            setShowLeftShadow={setShowLeftShadow}
            setShowRightShadow={setShowRightShadow}>
            <TableHeader
              columns={COLUMNS}
              sortState={{columnName: orderByField, order: sortOrder}}
              onSort={handleSortField}
            />
            <TableBody>
              {/* Row */}
              {rows.map((entry, index) => (
                <TableRow
                  rowIndex={index}
                  key={`contact-row-${entry.id}`}
                  testId={`contact-row-${entry.id}`}>
                  {COLUMNS.map(({renderCell, ...rest}) =>
                    renderCell(entry, {
                      onClick: handleRowClick(entry.data),
                      ...rest,
                    }),
                  )}
                </TableRow>
              ))}
            </TableBody>
          </TableContainer>
          <Pagination
            currentIndex={contactsResource.page.pageIndex}
            numberOfElementsPerPage={contactsResource.page.pageSize}
            totalEntries={contactsResource.total}
            onChange={handlePageIndexChange}
            onNumberPerPageChange={handleChangeElementsPerPage}
          />
        </PageContainer>
      )}

      <ContactFormDialog
        contactPerson={selectedContact}
        formType={formType}
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
      />
      <ContactDetails
        showSideDrawer={showSideDrawer}
        setShowSideDrawer={setShowSideDrawer}
        contactPerson={selectedContact}
      />
    </>
  );
};

export default Contacts;
