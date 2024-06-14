import {
  GridColDef,
  GridColumnHeaderParams,
  GridRenderCellParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import {useTranslation} from 'react-i18next';
import Typography from '@mui/material/Typography';
import useTheme from '@mui/material/styles/useTheme';
import {ContactsView, PORTAL_PERSON_STATUS} from 'models/contacts';
import {convertToText} from 'utils/utils';
import {StatusChip} from 'components/StatusChip';
import {Resource} from 'models/misc';
import {getColumnProps} from 'components/DataGridLayout';
import Actions from './Actions';

interface Props {
  onDelete: (id: string) => void;
  onSendInvite: (id: string) => void;
  onRevokeAccess: (id: string) => void;
  customerPortalEnabled: boolean;
}
export const columns = ({
  onDelete,
  onRevokeAccess,
  onSendInvite,
  customerPortalEnabled,
}: Props): GridColDef[] => [
  getColumnProps({
    field: 'name',
    headerName: 'NAME',
    flex: 1,
    headerAlign: 'left',
    renderCell: (params: GridRenderCellParams<any, any, any>) => (
      <Typography
        variant="body2"
        sx={{
          wordBreak: 'break-word',
          whiteSpace: 'wrap',
          color: 'primary.light',
          opacity: customerPortalEnabled ? 1 : 0.4,
        }}>
        {params.value}
      </Typography>
    ),
  }),
  getColumnProps({
    field: 'email',
    headerName: 'EMAIL ADDRESS',
    flex: 2,
    headerAlign: 'left',
    renderCell: (params: GridRenderCellParams<any, any, any>) => (
      <Typography
        variant="body2"
        sx={{
          wordBreak: 'break-all',
          whiteSpace: 'wrap',
          opacity: customerPortalEnabled ? 1 : 0.4,
        }}>
        {params.value}
      </Typography>
    ),
  }),
  getColumnProps({
    field: 'role',
    headerName: 'ROLE',
    flex: 1,
    headerAlign: 'left',
    renderCell: (params: GridRenderCellParams<any, any, any>) => {
      const {t} = useTranslation();
      const role = params.value?.[0] || '-';
      return (
        <Typography
          variant="body2"
          sx={{opacity: customerPortalEnabled ? 1 : 0.4}}>
          {t(convertToText(role).trim())}
        </Typography>
      );
    },
  }),
  getColumnProps({
    field: 'access',
    headerName: 'ACCESS',
    type: 'string',
    align: 'center',
    renderHeader: (params: GridColumnHeaderParams) => {
      const {t} = useTranslation();
      return (
        <Typography variant="subtitle2" color="textSecondary">
          {params.colDef.headerName && t(params.colDef.headerName)}
        </Typography>
      );
    },
    renderCell: (params: GridRenderCellParams<any, any, any>) => {
      const theme = useTheme();
      switch (params.value) {
        case PORTAL_PERSON_STATUS.ACTIVE:
          return (
            <StatusChip
              label="Active"
              style={{background: theme.palette.success.main}}
            />
          );
        case PORTAL_PERSON_STATUS.PENDING:
          return (
            <StatusChip
              label="Pending"
              style={{background: theme.palette.primary.mainLight}}
            />
          );
        case PORTAL_PERSON_STATUS.REVOKED:
          return (
            <StatusChip
              label="Revoked"
              style={{background: theme.palette.error.main}}
            />
          );
        case PORTAL_PERSON_STATUS.INACTIVE:
          return (
            <StatusChip
              label="Inactive"
              style={{background: theme.palette.text.secondary}}
            />
          );
        default:
          return null;
      }
    },
  }),
  getColumnProps({
    field: 'actions',
    headerName: '',
    flex: 1,
    align: 'right',
    sortable: false,
    renderCell: (params: GridRenderCellParams<ContactsView>) => {
      const contact = params.value;
      return (
        <Actions
          onDelete={onDelete}
          onRevokeAccess={onRevokeAccess}
          onSendInvite={onSendInvite}
          contact={contact}
          customerPortalEnabled={customerPortalEnabled}
        />
      );
    },
  }),
];

export const makeRows = (contacts: Resource<ContactsView>): GridRowsProp =>
  contacts
    ? contacts.data.map((item: ContactsView) => ({
        id: item.id,
        photoUrl: item.userAccount.photoUrl,
        name: `${item.userAccount.firstName} ${item.userAccount.lastName}`,
        email: item.userAccount.contact.email || '-',
        phone: item.userAccount.contact.phone || '-',
        secondaryPhone: item.additionalInfo?.secondaryPhone || '-',
        role: item.userAccount.roles.map((role) => convertToText(role)),
        access: item.userAccount.status,
        actions: item,
        // do not delete 'contactPerson'
        contactPerson: item,
      }))
    : [];
