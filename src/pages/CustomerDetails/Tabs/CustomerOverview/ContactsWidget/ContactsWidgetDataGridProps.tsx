import {
  GridAlignment,
  GridColDef,
  GridColumnHeaderParams,
  GridRenderCellParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import {useTranslation} from 'react-i18next';
import Typography from '@mui/material/Typography';
import {Avatar, Box} from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';

import {ContactsStatus, ContactsView} from 'models/contacts';
import {convertToText} from 'utils/utils';
import {StatusChip} from 'components/StatusChip';
import {Resource} from 'models/misc';
import {Actions} from './Actions';

const defaultProps = {
  editable: false,
  renderHeader: (params: GridColumnHeaderParams) => {
    const {t} = useTranslation();
    return (
      <Typography variant="subtitle2" color="textSecondary">
        {params.colDef.headerName && t(params.colDef.headerName)}
      </Typography>
    );
  },
  renderCell: (params: GridRenderCellParams<any, any, any>) => (
    <Typography variant="body2" mx="0.5em">
      {params.value}
    </Typography>
  ),
};
const defaultAlignment: {
  flex: number;
  headerAlign: GridAlignment;
  align: GridAlignment;
} = {
  flex: 1,
  headerAlign: 'center',
  align: 'center',
};

export const columns = (
  getEditableContacts: (item: ContactsView) => void,
  getDeletableContacts: (item: ContactsView) => void,
): GridColDef[] => [
  {
    field: 'name',
    headerName: 'Name',
    type: 'string',
    flex: 1,
    headerAlign: 'left',
    renderHeader: (params: GridColumnHeaderParams) => (
      <Typography variant="subtitle2" color="textSecondary">
        {params.colDef.headerName}
      </Typography>
    ),
    renderCell: (params) => (
      <Box display="flex" alignItems="center">
        <Avatar
          src={params.row.photoUrl || ''}
          sx={{width: '1.750em', height: '1.750em', mr: '0.625em'}}
        />
        {params.row.name}
      </Box>
    ),
  },

  {
    field: 'email',
    headerName: 'Email',
    type: 'string',
    flex: 2,
    headerAlign: 'left',
    ...defaultProps,
  },

  {
    field: 'phone',
    headerName: 'Phone',
    type: 'string',
    flex: 1,
    headerAlign: 'left',
    ...defaultProps,
  },
  {
    field: 'secondaryPhone',
    headerName: '2nd Phone',
    type: 'string',
    flex: 1,
    headerAlign: 'left',
    ...defaultProps,
  },
  {
    field: 'role',
    headerName: 'Role',
    type: 'string',
    flex: 1,
    headerAlign: 'left',
    ...defaultProps,
    renderCell: (params: GridRenderCellParams<any, any, any>) => {
      const {t} = useTranslation();
      const [value = ''] = params.value;
      return (
        <Typography variant="body2" mx="0.5em">
          {t(value)}
        </Typography>
      );
    },
  },
  {
    field: 'access',
    headerName: 'Access',
    type: 'string',
    ...defaultAlignment,
    editable: false,
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
        case ContactsStatus.ACTIVE:
          return (
            <StatusChip
              label="Active"
              style={{background: theme.palette.success.main}}
            />
          );
        case ContactsStatus.PENDING:
          return (
            <StatusChip
              label="Invitation sent"
              style={{background: theme.palette.primary.main}}
            />
          );
        default:
          return (
            <StatusChip
              label="Inactive"
              style={{background: theme.palette.text.secondary}}
            />
          );
      }
    },
  },
  {
    field: 'actions',
    headerName: 'Actions',
    type: 'actions',
    renderHeader: (params: GridColumnHeaderParams) => {
      const {t} = useTranslation();
      return (
        <Typography variant="subtitle2" color="textSecondary">
          {params.colDef.headerName && t(params.colDef.headerName)}
        </Typography>
      );
    },
    renderCell: (params) => (
      <Actions
        onEdit={() => getEditableContacts(params.value)}
        onDelete={() => getDeletableContacts(params.value)}
        contactId={params.value.id}
        status={params.value.userAccount.status}
      />
    ),
    ...defaultAlignment,
  },
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
      }))
    : [];
