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
  useUpdatePropertyContactPerson,
} from 'hooks/reactQuery/useContacts';
import {createEmptyResource} from 'utils/paging-utils';
import {useTranslation} from 'react-i18next';
import {getDataGridHeight} from 'utils/utils';
import {GridRowsProp} from '@mui/x-data-grid';
import WidgetContactFormDialog from 'pages/Contacts/ContactsWidget/WidgetContactFormDialog';
import {Confirm} from 'components/Confirm';
import {Switch} from 'components/Switch';
import ContactDetails from 'pages/Contacts/ContactDetails';
import {UserAccountStatus} from 'models/user';
import {useCustomer} from 'hooks/reactQuery/useCustomers';
import {Alert} from '@mui/material';
import {columns, makeRows} from './CustomerPortalDataGridProps';

interface Props {
  customerId: string;
  customerPortalEnabled: boolean;
}

const CustomerPortalWidget = ({customerId, customerPortalEnabled}: Props) => {
  const {t} = useTranslation();

  const [rows, setRows] = useState<GridRowsProp>([]);
  const [selectedContact, setSelectedContact] = useState<ContactsView>();
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [isWidgetActive, setIsWidgetActive] = useState(customerPortalEnabled);
  const [showSideDrawer, setShowSideDrawer] = useState(false);

  const {updateCustomer} = useCustomer(true);
  const {mutate: updatePropertyContactPerson} = useUpdatePropertyContactPerson(
    customerId,
    'Contact updated successfully',
  );
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
    refetch();
  };

  const handleDeleteContact = useCallback(
    (id: string) => {
      setSelectedContact(contactsResource.data.find((el) => el.id === id));
      setOpenDeleteConfirm(true);
    },
    [contactsResource],
  );

  const handleRevokeAccess = useCallback((id: string) => {
    updatePropertyContactPerson({
      propertyContactPersonId: id,
      body: {status: UserAccountStatus.LOCKED},
    });
  }, []);

  const handleSendInvite = useCallback(
    (id: string) => {
      const contact = contactsResource.data.find((el) => el.id === id);
      inviteContact({
        propertyContactPersonId: id,
        username: encodeURIComponent(
          contact?.userAccount?.contact?.email || '',
        ),
      });
    },
    [contactsResource],
  );

  const handleDeleteConfirm = async ({
    propertyContactPersonId,
  }: {
    propertyContactPersonId: string;
  }) => {
    await deleteContact({propertyOwnerId: customerId, propertyContactPersonId});
    await refetch();
    setOpenDeleteConfirm(false);
  };

  const handleSwitchChange = async (isActive: boolean) => {
    await updateCustomer({customerPortalEnabled: isActive}, customerId);
    setIsWidgetActive(isActive);
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
          rows.length && isWidgetActive ? (
            <AddOutlinedIcon sx={{color: 'primary.dark'}} />
          ) : undefined
        }>
        {!customerPortalEnabled && (
          <Alert severity="warning">
            <Typography variant="subtitle2">
              {t('Customer Portal disabled')}
            </Typography>
            <Typography variant="body1">
              {t(
                'Access to the Customer Portal is disabled on the company level. All invited users don’t have access.',
              )}
            </Typography>
          </Alert>
        )}
        <DataGridLayout
          isWidget
          fullHeight={false}
          height={getDataGridHeight(rows.length, rows.length)}
          rows={rows}
          columns={columns({
            onDelete: handleDeleteContact,
            onRevokeAccess: handleRevokeAccess,
            onSendInvite: handleSendInvite,
            customerPortalEnabled: isWidgetActive,
          })}
          loading={isFetching}
          onCellClick={(params) => {
            if (isWidgetActive) {
              setSelectedContact(params.row.contactPerson as ContactsView);
              setShowSideDrawer(true);
            }
          }}
          noRowsEmptySection={
            <EmptySection
              showActionBtn
              illustration="contacts"
              size="tiny"
              disableActionBtn={!isWidgetActive}
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
