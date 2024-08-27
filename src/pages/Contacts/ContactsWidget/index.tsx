import {Typography} from '@mui/material';
import {InfoCard} from 'components/InfoCard';
import {ReactComponent as HeadphonesHumanIcon} from 'assets/icons/HeadphonesHumanIcon.svg';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import {useTranslation} from 'react-i18next';
import {
  ConnectionTypeLabels,
  ContactPersonAssociationType,
  RefContactPersonView,
} from 'models/contacts';
import {
  useAddContactPersonAssociation,
  useDisconnectContactPersonAssociation,
  useRefContactPersons,
} from 'hooks/reactQuery/useContacts';
import {DataGridLayout} from 'components/DataGridLayout';
import {GridRowsProp} from '@mui/x-data-grid';
import {useCallback, useEffect, useState} from 'react';
import {createEmptyResource} from 'utils/paging';
import {getDataGridHeight} from 'utils/utils';
import {Confirm} from 'components/Confirm';
import {EmptySection} from 'components/EmptySection';
import {getColumns, makeRows} from './DataGridProps';
import ContactDetails from '../ContactDetails';
import WidgetContactFormDialog from './WidgetContactFormDialog';
import ContactFormDialog from '../ContactFormDialog';

interface Props {
  refId: string;
  refType: ContactPersonAssociationType;
}

const PAGE_SIZE = 25;

const ContactsWidget = ({refId, refType}: Props) => {
  const {t} = useTranslation();

  const [rows, setRows] = useState<GridRowsProp>([]);
  const [showSideDrawer, setShowSideDrawer] = useState(false);
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [selectedContact, setSelectedContact] =
    useState<RefContactPersonView>();
  const [formType, setFormType] = useState<'create' | 'edit'>('create');

  const {
    data: contactPersonsResource = createEmptyResource<RefContactPersonView>(
      25,
    ),
    isFetching,
    refetch,
  } = useRefContactPersons({
    refType,
    refId,
    pageSize: PAGE_SIZE,
    pageIndex: 0,
  });
  const {mutateAsync: addContactConnection} = useAddContactPersonAssociation(
    'Connection successfully added',
  );
  const {mutateAsync: disconnect, isLoading: isDisconnecting} =
    useDisconnectContactPersonAssociation('Connection removed');

  useEffect(() => {
    if (!isFetching) {
      setRows(makeRows(contactPersonsResource));
    }
  }, [contactPersonsResource, isFetching]);

  const handleEditContact = useCallback(
    (contact: RefContactPersonView) => {
      setSelectedContact(contact);
      setOpenFormDialog(true);
      setFormType('edit');
    },
    [contactPersonsResource],
  );

  const handleDeleteContact = useCallback(
    (contact: RefContactPersonView) => {
      setSelectedContact(contact);
      setOpenDeleteConfirm(true);
    },
    [contactPersonsResource],
  );

  const handleAfterSubmit = async (newContactPersonId?: string) => {
    if (formType === 'create') {
      await addContactConnection({
        body: {refId, refType},
        contactPersonId: newContactPersonId || '',
      });
    }
    refetch();
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

  return (
    <>
      <InfoCard
        header={<Typography variant="h5">{t('Contacts')}</Typography>}
        headerIcon={
          <HeadphonesHumanIcon style={{width: '2rem', height: '2rem'}} />
        }
        handleAction={async () => {
          await setSelectedContact(undefined);
          setFormType('create');
          setOpenFormDialog(true);
        }}
        headerActionIcon={
          rows.length ? (
            <AddOutlinedIcon sx={{color: 'primary.dark'}} />
          ) : undefined
        }>
        <DataGridLayout
          isWidget
          fullHeight={false}
          height={getDataGridHeight(rows.length, rows.length)}
          rows={rows}
          columns={getColumns({
            onEdit: handleEditContact,
            onDelete: handleDeleteContact,
          })}
          loading={isFetching}
          onCellClick={(params) => {
            setSelectedContact(params.row.contact as RefContactPersonView);
            setShowSideDrawer(true);
          }}
          noRowsEmptySection={
            <EmptySection
              showActionBtn
              illustration="contacts"
              size="tiny"
              containerStyle={{
                width: '60%',
                m: 'auto',
                paddingTop: '50px',
              }}
              label="No Contact Persons"
              subLabel="Do you want to add someone?"
              btnLabel="New Contact person"
              btnAction={async () => {
                await setSelectedContact(undefined);
                setFormType('create');
                setOpenFormDialog(true);
              }}
            />
          }
        />
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
          contactPerson={selectedContact}
          formType={formType}
          openDialog={openFormDialog}
          setOpenDialog={setOpenFormDialog}
          onAfterSubmit={handleAfterSubmit}
        />
      ) : (
        <ContactFormDialog
          contactPerson={selectedContact}
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
        title="Remove connection"
        content={t(
          'You are about to disconnect contact from this {{refType}}.',
          {refType: t(ConnectionTypeLabels[refType])},
        )}
        secondContent="Are you sure about it?"
        closeBtnLabel="Cancel"
        confirmBtnLabel="Remove"
      />
    </>
  );
};

export default ContactsWidget;
