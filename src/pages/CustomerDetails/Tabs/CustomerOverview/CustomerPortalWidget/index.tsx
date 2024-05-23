import {EmptySection} from 'components/EmptySection';
import {ContactsView, ServiceCompanyContactPersonView} from 'models/contacts';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import {ReactComponent as MonitorTeamIcon} from 'assets/icons/MonitorTeamIcon.svg';
import {useCallback, useEffect, useState} from 'react';
import {InfoCard} from 'components/InfoCard';
import {DataGridLayout} from 'components/DataGridLayout';
import {
  useCreatePropertyContactPerson,
  useDeletePropertyOwnerContactPerson,
  useInviteContact,
  usePropertyOwnerContacts,
} from 'hooks/reactQuery/useContacts';
import {createEmptyResource} from 'utils/paging-utils';
import {useTranslation} from 'react-i18next';
import {getDataGridHeight} from 'utils/utils';
import {GridRowsProp} from '@mui/x-data-grid';
import WidgetContactFormDialog from 'pages/Contacts/ContactsWidget/WidgetContactFormDialog';
import {Confirm} from 'components/Confirm';
import {Switch} from 'components/Switch';
import ContactDetails from 'pages/Contacts/ContactDetails';
import {columns, makeRows} from './CustomerPortalDataGridProps';

interface Props {
  customerId: string;
}

const CustomerPortalWidget = ({customerId}: Props) => {
  const {t} = useTranslation();

  const [rows, setRows] = useState<GridRowsProp>([]);
  const [selectedContact, setSelectedContact] = useState<ContactsView>();
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [isWidgetActive, setIsWidgetActive] = useState(false);
  const [showSideDrawer, setShowSideDrawer] = useState(false);

  const {mutateAsync: addContact} = useCreatePropertyContactPerson(
    customerId,
    'Contact added successfully',
  );
  const {mutateAsync: inviteContact} = useInviteContact(
    'Contact invited successfully',
  );
  const {mutateAsync: deleteContact, isLoading: isDeleting} =
    useDeletePropertyOwnerContactPerson('Contact deleted successfully');
  const {
    data: contactsResource = createEmptyResource<ContactsView>(5),
    isFetching,
    refetch,
  } = usePropertyOwnerContacts({pageIndex: 0, pageSize: 25}, customerId);
  useEffect(() => {
    if (!isFetching) {
      setRows(makeRows(contactsResource));
    }
  }, [contactsResource, isFetching]);

  const handleAfterSubmit = async (newContactPersonId?: string) => {
    await addContact({
      contactPersonId: newContactPersonId || '',
      externalId: '',
    });
    await refetch();
  };

  const handleDeleteContact = useCallback(
    (id: string) => {
      setSelectedContact(contactsResource.data.find((el) => el.id === id));
      setOpenDeleteConfirm(true);
    },
    [contactsResource],
  );

  const handleRevokeAccess = useCallback((id: string) => {
    // TODO: Add revoke access action here
    console.log('Revoke access', id);
  }, []);

  const handleSendInvite = useCallback(async (id: string) => {
    const contact = contactsResource.data.find((el) => el.id === id);
    await inviteContact({
      propertyContactPersonId: id,
      username: contact?.userAccount?.contact?.email || '',
    });
  }, []);

  const handleDeleteConfirm = async ({
    propertyContactPersonId,
  }: {
    propertyContactPersonId: string;
  }) => {
    await deleteContact({propertyOwnerId: customerId, propertyContactPersonId});
    await refetch();
    setOpenDeleteConfirm(false);
  };

  const handleSwitchChange = (val: boolean) => {
    // TODO: Add SWITCH action here
    console.log('SWITCH', val);
    setIsWidgetActive(val);
  };

  return (
    <>
      <InfoCard
        header={
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="h5">{t('Customer Portal')}</Typography>
            <Switch
              value={isWidgetActive}
              onChanged={(val) => handleSwitchChange(val)}
            />
          </Box>
        }
        headerIcon={<MonitorTeamIcon style={{width: '2rem', height: '2rem'}} />}
        handleAction={async () => {
          await setSelectedContact(undefined);
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
          columns={columns({
            onDelete: handleDeleteContact,
            onRevokeAccess: handleRevokeAccess,
            onSendInvite: handleSendInvite,
          })}
          loading={isFetching}
          onCellClick={(params) => {
            setSelectedContact(params.row.contactPerson as ContactsView);
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
                setOpenFormDialog(true);
              }}
            />
          }
        />
      </InfoCard>
      <ContactDetails
        showSideDrawer={showSideDrawer}
        setShowSideDrawer={setShowSideDrawer}
        contactPerson={
          {
            ...contactsResource.data.find(
              (el) => el.id === selectedContact?.id,
            ),
            id: selectedContact?.additionalInfo.contactPersonId,
          } as unknown as ServiceCompanyContactPersonView
        }
      />
      <WidgetContactFormDialog
        contactPerson={
          selectedContact as unknown as ServiceCompanyContactPersonView
        }
        formType="create"
        openDialog={openFormDialog}
        setOpenDialog={setOpenFormDialog}
        onAfterSubmit={handleAfterSubmit}
      />
      <Confirm
        maxWidth={450}
        disableActions={isDeleting}
        open={openDeleteConfirm}
        onConfirm={() =>
          handleDeleteConfirm({
            propertyContactPersonId: selectedContact?.id as string,
          })
        }
        onClose={() => setOpenDeleteConfirm(false)}
        title="Delete"
        content={t(
          'Do you want to delete {{customerName}} from the contact persons list?',
          {
            customerName: `${selectedContact?.userAccount.firstName} ${selectedContact?.userAccount.lastName}`,
          },
        )}
        closeBtnLabel="No"
        confirmBtnLabel="Yes"
      />
    </>
  );
};
export default CustomerPortalWidget;
