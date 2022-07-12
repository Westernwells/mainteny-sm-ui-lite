import {Typography} from '@mui/material';
import {
  GridAlignment,
  GridColDef,
  GridColumnHeaderParams,
  GridRenderCellParams,
  GridRowModel,
} from '@mui/x-data-grid';
import {UserView} from 'models/user';
import {useTranslation} from 'react-i18next';
import {formatDate} from 'utils/datetime';
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
    <Typography variant="body2">{params.value}</Typography>
  ),
};

const defaultAlignment: {
  headerAlign: GridAlignment;
  align: GridAlignment;
} = {
  headerAlign: 'left',
  align: 'left',
};

export const columns = (
  getEditableUser: (item: UserView) => void,
  getUserToken: (item: UserView) => void,
): GridColDef[] => [
  {
    field: 'email',
    headerName: 'Email',
    flex: 1.5,
    type: 'string',
    ...defaultProps,
    ...defaultAlignment,
  },

  {
    field: 'name',
    headerName: 'Name',
    flex: 1.5,
    type: 'string',
    ...defaultProps,
    ...defaultAlignment,
  },

  {
    field: 'phone',
    headerName: 'Phone',
    flex: 1.5,
    type: 'string',
    ...defaultProps,
    ...defaultAlignment,
  },
  {
    field: 'createdOn',
    headerName: 'Created on',
    flex: 1,
    type: 'string',
    ...defaultProps,
    ...defaultAlignment,
  },
  {
    field: 'actions',
    headerName: 'Actions',
    type: 'actions',
    ...defaultAlignment,
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
        onEdit={() => getEditableUser(params.value)}
        onGetUserToken={() => getUserToken(params.value)}
      />
    ),
  },
];

export const makeRows = (
  employees: UserView[],
): GridRowModel<{[key: string]: any}[]> =>
  employees
    ? employees.map((item: UserView, index: number) => ({
        id: index,
        name: `${item.userAccount.firstName} ${item.userAccount.lastName}`,
        email: item.userAccount.contact.email,
        phone: item.userAccount.contact.phone,
        createdOn: formatDate(item?.userAccount?.meta?.createdAt) || '-',
        actions: item,
      }))
    : [];
