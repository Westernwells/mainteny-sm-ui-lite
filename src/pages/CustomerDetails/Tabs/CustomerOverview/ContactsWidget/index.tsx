import {useMemo, useRef, useState} from 'react';
import Typography from '@mui/material/Typography';
import {InfoCard} from 'components/InfoCard';
import {ReactComponent as HeadphonesHumanIcon} from 'assets/icons/HeadphonesHumanIcon.svg';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import {useTranslation} from 'react-i18next';
import {
  ConnectionTypeLabels,
  ContactPersonAssociationType,
  RefContactPersonView,
  RefContactTableRow,
} from 'models/contacts';
import {
  useAddContactPersonAssociation,
  useDisconnectContactPersonAssociation,
  useRefContactPersons,
} from 'hooks/reactQuery/useContacts';
import {createEmptyResource} from 'utils/paging';
import {Confirm} from 'components/Confirm';
import {EmptySection} from 'components/EmptySection';
import ContactDetails from 'pages/Contacts/ContactDetails';
import WidgetContactFormDialog from 'pages/Contacts/ContactsWidget/WidgetContactFormDialog';
import ContactFormDialog from 'pages/Contacts/ContactFormDialog';
import TableContainer from 'components/Table/TableContainer';
import TableHeader from 'components/Table/TableHeader';
import TableBody from 'components/Table/TableBody';
import TableRow from 'components/Table/TableRow';
import {aggregateCustomerContactsRow} from 'utils/contact';
import Cell from 'components/Table/TableCell';
import TableCellText from 'components/Table/TableCellText';
import {ACTION_CELL_WIDTH, TableColumnWithRender} from 'models/table';
import {useNavigate} from 'react-router-dom';
import {Avatar} from 'components/Avatar';
import {theme} from 'theme';
import Actions from './Actions';

interface Props {
  refId: string;
  refType: ContactPersonAssociationType;
}

const PAGE_SIZE = 25;

const ContactsWidget = ({refId, refType}: Props) => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedContact, setSelectedContact] = useState<
    RefContactPersonView | undefined
  >();
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [formType, setFormType] = useState<'create' | 'edit'>('create');
  const [showSideDrawer, setShowSideDrawer] = useState(false);
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);

  const {
    data: contactPersonsResource = createEmptyResource<RefContactPersonView>(
      PAGE_SIZE,
    ),
    refetch,
  } = useRefContactPersons({refType, refId, pageSize: PAGE_SIZE, pageIndex: 0});

  const {mutateAsync: addContactConnection} = useAddContactPersonAssociation(
    'Connection successfully added',
  );
  const {mutateAsync: disconnect, isLoading: isDisconnecting} =
    useDisconnectContactPersonAssociation('Connection removed');

  const handleDeleteContact = (refContact: RefContactPersonView) => {
    setSelectedContact(refContact);
    setOpenDeleteConfirm(true);
  };

  const handleEditContact = async (refContact: RefContactPersonView) => {
    setSelectedContact(refContact);
    setFormType('edit');
    setOpenFormDialog(true);
  };

  const handleAddContact = async () => {
    setSelectedContact(undefined);
    setFormType('create');
    setOpenFormDialog(true);
  };

  const handleAfterSubmit = async (newContactPersonId?: string) => {
    if (formType === 'create') {
      await addContactConnection({
        body: {refId, refType},
        contactPersonId: newContactPersonId || '',
      });
    }
    await refetch();
    setSelectedContact(undefined);
  };

  const handleDeleteConfirm = async ({
    contactPersonId,
    associationId,
  }: {
    contactPersonId: string;
    associationId: string;
  }) => {
    await disconnect({contactPersonId, associationId});
    await refetch();
    setOpenDeleteConfirm(false);
  };

  const handleRowClick = (params: RefContactPersonView) => () => {
    setSelectedContact(params as RefContactPersonView);
    setShowSideDrawer(true);
  };

  const handleEmployeeCellClick = (id: string) => () => {
    navigate(`/employees/details/${id}`);
  };

  const rows = useMemo(
    () => aggregateCustomerContactsRow(contactPersonsResource.data),
    [contactPersonsResource],
  );

  const COLUMNS = useMemo<TableColumnWithRender<RefContactTableRow>[]>(
    () => [
      {
        headerName: 'Name',
        key: 'customer-contact-portal-cell-name',
        width: '209px',
        isFirst: true,
        showShadows: showRightShadow ? 'right' : undefined,
        renderCell: (refContact, cellProps) => (
          <Cell
            {...cellProps}
            onClick={handleEmployeeCellClick(refContact.contactId)}>
            <Avatar
              onlyFirstInitial
              labelStyles={{
                color: theme.palette.primary.light,
              }}
              key={`company-avatar-${refContact.contactId}`}
              userAccount={refContact.userAccount}
            />
          </Cell>
        ),
      },
      {
        headerName: 'Company',
        key: 'customer-contact-cell-company',
        width: '209px',
        renderCell: (refContact, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>{refContact.company}</TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'Phone',
        key: 'customer-contact-cell-phone',
        width: '209px',
        renderCell: (refContact, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>{refContact.phone}</TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'Phone 2',
        key: 'customer-contact-cell-secondary-phone',
        width: '209px',
        renderCell: (refContact, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>{refContact.secondaryPhoneNumber}</TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'Email Address',
        key: 'customer-contact-cell-email',
        width: '209px',
        renderCell: (refContact, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText
              tableCellTextStyles={{
                color: theme.palette.primary.light,
              }}>
              <TableCellText>{refContact.emailAddress}</TableCellText>
            </TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'Role',
        key: 'customer-contact-cell-role',
        width: '209px',
        renderCell: (refContact, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>{t(refContact.role)}</TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'action',
        key: 'customer-contact-cell-actions',
        isHeaderNameHidden: true,
        align: 'center',
        width: ACTION_CELL_WIDTH, // set static width that will not change
        isLast: true,
        noPadding: true,
        showShadows: showLeftShadow ? 'left' : undefined,
        renderCell: (refContact, cellProps) => (
          <Cell {...cellProps} onClick={undefined}>
            <Actions
              onEdit={() => handleEditContact(refContact.contactResourceData)}
              onDelete={() =>
                handleDeleteContact(refContact.contactResourceData)
              }
            />
          </Cell>
        ),
      },
    ],
    [showLeftShadow, showRightShadow],
  );

  const currentContact = useMemo(
    () =>
      contactPersonsResource.data.find((el) => el.id === selectedContact?.id) ||
      selectedContact,
    [contactPersonsResource.data, selectedContact],
  );

  return (
    <>
      <InfoCard
        header={<Typography variant="h5">{t('Contacts')}</Typography>}
        headerIcon={
          <HeadphonesHumanIcon style={{width: '2rem', height: '2rem'}} />
        }
        handleAction={handleAddContact}
        headerActionIcon={
          rows.length ? (
            <AddOutlinedIcon sx={{color: 'primary.dark'}} />
          ) : undefined
        }>
        <TableContainer
          containerRef={containerRef}
          setShowLeftShadow={setShowLeftShadow}
          setShowRightShadow={setShowRightShadow}>
          <TableHeader columns={COLUMNS} capitalize />
          <TableBody>
            {rows.map((entry) => (
              <TableRow
                key={`customer-contact-portal-row-${entry.id}`}
                testId={`customer-contact-portal-row-${entry.id}`}>
                {COLUMNS.map(({renderCell, ...rest}) =>
                  renderCell(entry, {
                    onClick: handleRowClick(entry.contactResourceData),
                    ...rest,
                  }),
                )}
              </TableRow>
            ))}
          </TableBody>
        </TableContainer>

        {rows.length < 1 && (
          <EmptySection
            showActionBtn
            illustration="contacts"
            size="tiny"
            containerStyle={{width: '60%', m: 'auto', paddingTop: '50px'}}
            label={t('No Contact Persons')}
            subLabel={t('Do you want to add someone?')}
            btnLabel={t('New Contact person')}
            btnAction={handleAddContact}
          />
        )}
      </InfoCard>

      <ContactDetails
        showSideDrawer={showSideDrawer}
        setShowSideDrawer={setShowSideDrawer}
        contactPerson={contactPersonsResource.data.find(
          (el) => el.id === selectedContact?.id,
        )}
      />

      {formType === 'create' ? (
        <WidgetContactFormDialog
          contactPerson={currentContact}
          formType={formType}
          openDialog={openFormDialog}
          setOpenDialog={setOpenFormDialog}
          onAfterSubmit={handleAfterSubmit}
        />
      ) : (
        <ContactFormDialog
          contactPerson={currentContact}
          formType={formType}
          openDialog={openFormDialog}
          setOpenDialog={setOpenFormDialog}
          onAfterSubmit={handleAfterSubmit}
        />
      )}

      <Confirm
        maxWidth={450}
        disableActions={isDisconnecting}
        open={openDeleteConfirm}
        onConfirm={() =>
          handleDeleteConfirm({
            contactPersonId: selectedContact?.id || '',
            associationId: selectedContact?.associationId || '',
          })
        }
        onClose={() => setOpenDeleteConfirm(false)}
        title={t('Remove connection')}
        content={t(
          'You are about to disconnect contact from this {{refType}}.',
          {
            refType: t(ConnectionTypeLabels[refType]),
          },
        )}
        secondContent={t('Are you sure about it?')}
        closeBtnLabel={t('Cancel')}
        confirmBtnLabel={t('Remove')}
      />
    </>
  );
};

export default ContactsWidget;
