import {
  GridAlignment,
  GridColDef,
  GridColumnHeaderParams,
  GridRenderCellParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import {useTranslation} from 'react-i18next';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import {convertToText} from 'utils/utils';
import {
  CustomerContactPersonFormModel,
  CustomerContactPersonsFormModel,
} from './model';

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
  getEditableContacts: (index: number) => void,
  deleteContact: (index: number) => void,
): GridColDef[] => [
  {
    field: 'name',
    headerName: 'Name',
    type: 'string',
    flex: 1,
    headerAlign: 'left',
    ...defaultProps,
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
      <Box>
        <IconButton
          component="a"
          onClick={() => getEditableContacts(params.value)}>
          <Edit sx={{color: 'action.active'}} fontSize="small" />
        </IconButton>
        <IconButton component="a" onClick={() => deleteContact(params.value)}>
          <Delete sx={{color: 'action.active'}} fontSize="small" />
        </IconButton>
      </Box>
    ),
    ...defaultAlignment,
  },
];

export const makeRows = ({
  contactPersons,
}: CustomerContactPersonsFormModel): GridRowsProp =>
  contactPersons
    ? contactPersons.map((item: CustomerContactPersonFormModel, index) => ({
        id: index,
        name: `${item.userAccount.firstName} ${item.userAccount.lastName}`,
        email: item.userAccount.contact.email || '-',
        phone: item.userAccount.contact.phone || '-',
        secondaryPhone: item.propertyContactPerson?.secondaryPhone || '-',
        role: item.propertyContactPerson.roles.map((role) =>
          convertToText(role),
        ),
        actions: index,
      }))
    : [];
