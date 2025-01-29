import {ContactsView, ServiceCompanyContactPersonView} from 'models/contacts';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import {ReactComponent as MonitorTeamIcon} from 'assets/icons/MonitorTeamIcon.svg';
import {useCallback, useMemo, useRef, useState} from 'react';
import {InfoCard} from 'components/InfoCard';
import {
  useCreatePropertyContactPerson,
  useDeletePropertyOwnerContactPerson,
  useInviteContact,
  usePropertyOwnerContacts,
  useUpdatePropertyContactPerson,
} from 'hooks/reactQuery/useContacts';
import {createEmptyResource} from 'utils/paging';
import {useTranslation} from 'react-i18next';
import WidgetContactFormDialog from 'pages/Contacts/ContactsWidget/WidgetContactFormDialog';
import {Confirm} from 'components/Confirm';
import {Switch} from 'components/Switch';
import ContactDetails from 'pages/Contacts/ContactDetails';
import {UserAccountStatus} from 'models/user';
import {useCustomer} from 'hooks/reactQuery/useCustomers';
import {Alert} from '@mui/material';
import {ACTION_CELL_WIDTH, TableColumnWithRender} from 'models/table';
import {CustomerPortalTableRow} from 'models/customer';
import Cell from 'components/Table/TableCell';
import TableCellText from 'components/Table/TableCellText';
import TableContainer from 'components/Table/TableContainer';
import TableBody from 'components/Table/TableBody';
import TableRow from 'components/Table/TableRow';
import TableHeader from 'components/Table/TableHeader';
import {aggregateCustomerPortalRow, getStatusLabel} from 'utils/customer-utils';
import {StatusChip} from 'components/StatusChip';
import {EmptySection} from 'components/EmptySection';
import {useNavigate} from 'react-router-dom';
import {Avatar} from 'components/Avatar';
import {theme} from 'theme';
import Actions from './Actions';

interface Props {
  customerId: string;
  customerPortalEnabled: boolean;
}

const CustomerPortalWidget = ({customerId, customerPortalEnabled}: Props) => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedContact, setSelectedContact] = useState<ContactsView>();
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [isWidgetActive, setIsWidgetActive] = useState(customerPortalEnabled);
  const [showSideDrawer, setShowSideDrawer] = useState(false);
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);

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
    refetch,
  } = usePropertyOwnerContacts({pageIndex: 0, pageSize: 25}, customerId);

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

  const handleRowClick = (params: ContactsView) => () => {
    if (isWidgetActive) {
      setSelectedContact(params as ContactsView);
      setShowSideDrawer(true);
    }
  };

  const handleEmployeeCellClick = (id: string) => () => {
    navigate(`/employees/details/${id}`);
  };

  const rows = useMemo(
    () => aggregateCustomerPortalRow(contactsResource.data),
    [contactsResource],
  );

  const COLUMNS = useMemo<TableColumnWithRender<CustomerPortalTableRow>[]>(
    () => [
      {
        headerName: 'Name',
        key: 'customer-portal-cell-name',
        width: '362px',
        isFirst: true,
        showShadows: showRightShadow ? 'right' : undefined,
        renderCell: (customerPortal, cellProps) => (
          <Cell
            {...cellProps}
            onClick={handleEmployeeCellClick(customerPortal.customerId)}>
            <Avatar
              labelStyles={{
                color: isWidgetActive
                  ? theme.palette.primary.light
                  : theme.palette.text.disabled,
              }}
              key={`company-avatar-${customerPortal.customerId}`}
              userAccount={{firstName: customerPortal.name}}
            />
          </Cell>
        ),
      },
      {
        headerName: 'Email Address',
        key: 'customer-portal-cell-email',
        width: '362px',
        renderCell: (customerPortal, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText
              tableCellTextStyles={{
                color: isWidgetActive
                  ? theme.palette.primary.light
                  : theme.palette.text.disabled,
              }}>
              {customerPortal.emailAddress}
            </TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'Role',
        key: 'customer-portal-cell-role',
        width: '362px',
        renderCell: (customerPortal, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText
              tableCellTextStyles={{
                color: isWidgetActive
                  ? theme.palette.primary.light
                  : theme.palette.text.disabled,
              }}>
              {t(customerPortal.role)}
            </TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'Access',
        key: 'customer-portal-cell-access',
        width: '220px',
        align: 'center',
        renderCell: (customerPortal, cellProps) => {
          const label = getStatusLabel(customerPortal.access);
          return (
            <Cell {...cellProps}>
              <TableCellText>
                {label && (
                  <StatusChip
                    label={label}
                    style={{
                      background:
                        label === 'Active'
                          ? theme.palette.success.main
                          : label === 'Pending'
                          ? theme.palette.primary.mainLight
                          : label === 'Revoked'
                          ? theme.palette.error.main
                          : theme.palette.text.secondary,
                    }}
                  />
                )}
              </TableCellText>
            </Cell>
          );
        },
      },
      {
        headerName: 'action',
        key: 'customer-portal-cell-actions',
        isHeaderNameHidden: true,
        align: 'center',
        width: ACTION_CELL_WIDTH, // set static width that will not change
        isLast: true,
        noPadding: true,
        showShadows: showLeftShadow ? 'left' : undefined,
        renderCell: (customerPortal, cellProps) => (
          <Cell {...cellProps} onClick={undefined}>
            <Actions
              onDelete={handleDeleteContact}
              onRevokeAccess={handleRevokeAccess}
              onSendInvite={handleSendInvite}
              contact={customerPortal.contactResourceData}
              customerPortalEnabled={isWidgetActive}
            />
          </Cell>
        ),
      },
    ],
    [isWidgetActive, showLeftShadow, showRightShadow, handleDeleteContact],
  );

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
        handleAction={() => {
          setSelectedContact(undefined);
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

        <TableContainer
          containerRef={containerRef}
          setShowLeftShadow={setShowLeftShadow}
          setShowRightShadow={setShowRightShadow}>
          <TableHeader columns={COLUMNS} capitalize />
          <TableBody>
            {rows.map((entry) => (
              <TableRow
                key={`customer-portal-row-${entry.id}`}
                testId={`customer-portal-row-${entry.id}`}>
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
            disableActionBtn={!isWidgetActive}
            containerStyle={{
              width: '60%',
              m: 'auto',
              paddingTop: '50px',
            }}
            label="No Contact Persons"
            subLabel="Do you want to add someone?"
            btnLabel="New Contact person"
            btnAction={() => {
              setSelectedContact(undefined);
              setOpenFormDialog(true);
            }}
          />
        )}
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
