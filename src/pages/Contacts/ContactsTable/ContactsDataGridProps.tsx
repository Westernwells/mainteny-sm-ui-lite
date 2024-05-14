import Typography from '@mui/material/Typography';
import {GridColDef, GridRenderCellParams, GridRowsProp} from '@mui/x-data-grid';
import {getColumnProps} from 'components/DataGridLayout';
import {
  ServiceCompanyContactPersonOrderField,
  ServiceCompanyContactPersonView,
} from 'models/contacts';
import {Resource} from 'models/misc';
import {useTranslation} from 'react-i18next';
import {convertToText} from 'utils/utils';
import Notes from '../Notes';
import Actions, {IActions} from './Actions';

export const getColumns = ({
  onDelete,
  onEdit,
  onSendEmail,
  onShowDetails,
}: IActions): GridColDef[] => [
  getColumnProps({
    field: ServiceCompanyContactPersonOrderField.NAME,
    sortable: true,
    headerName: 'NAME',
    flex: 1.25,
    headerAlign: 'left',
    renderCell: (params: GridRenderCellParams<any, any, any>) => (
      <Typography
        variant="body2"
        sx={{wordBreak: 'break-word', whiteSpace: 'wrap'}}>
        {params.value}
      </Typography>
    ),
  }),
  getColumnProps({
    field: ServiceCompanyContactPersonOrderField.COMPANY,
    sortable: true,
    headerName: 'COMPANY',
    flex: 1.25,
    headerAlign: 'center',
    align: 'center',
    renderCell: (params: GridRenderCellParams<any, any, any>) => (
      <Typography
        variant="body2"
        sx={{wordBreak: 'break-word', whiteSpace: 'wrap'}}>
        {params.value}
      </Typography>
    ),
  }),
  getColumnProps({
    field: ServiceCompanyContactPersonOrderField.EMAIL,
    sortable: true,
    headerName: 'EMAIL',
    flex: 2,
    headerAlign: 'left',
    renderCell: (params: GridRenderCellParams<any, any, any>) => (
      <Typography
        variant="body2"
        sx={{wordBreak: 'break-all', whiteSpace: 'wrap'}}>
        {params.value}
      </Typography>
    ),
  }),
  getColumnProps({
    field: ServiceCompanyContactPersonOrderField.PHONE,
    sortable: true,
    headerName: 'PHONE 1',
    flex: 1,
    headerAlign: 'left',
  }),
  getColumnProps({
    field: ServiceCompanyContactPersonOrderField.SECONDARY_PHONE,
    sortable: true,
    headerName: 'PHONE 2',
    flex: 1,
    headerAlign: 'left',
  }),
  getColumnProps({
    field: ServiceCompanyContactPersonOrderField.ROLE,
    sortable: true,
    headerName: 'ROLE',
    flex: 1,
    headerAlign: 'left',
    renderCell: (params: GridRenderCellParams<any, any, any>) => {
      const {t} = useTranslation();
      const role = params.value?.[0] || '-';
      return (
        <Typography variant="body2">{t(convertToText(role).trim())}</Typography>
      );
    },
  }),
  getColumnProps({
    field: ServiceCompanyContactPersonOrderField.COMMENT_COUNT,
    sortable: true,
    headerName: 'NOTES',
    flex: 1,
    headerAlign: 'center',
    align: 'center',
    renderCell: (
      params: GridRenderCellParams<ServiceCompanyContactPersonView>,
    ) => (
      <Notes
        contactPersonId={params.value.id}
        notesCount={params?.value?.commentCount || 0}
      />
    ),
  }),
  getColumnProps({
    field: 'actions',
    headerName: 'ACTIONS',
    flex: 1,
    headerAlign: 'center',
    align: 'center',
    renderCell: (
      params: GridRenderCellParams<ServiceCompanyContactPersonView>,
    ) => (
      <Actions
        contactId={params.value.id}
        onDelete={onDelete}
        onEdit={onEdit}
        onShowDetails={onShowDetails}
        onSendEmail={onSendEmail}
      />
    ),
  }),
];

export const makeRows = (
  contacts: Resource<ServiceCompanyContactPersonView> | undefined,
): GridRowsProp =>
  contacts && contacts.data.length
    ? contacts.data.map((item: ServiceCompanyContactPersonView) => ({
        id: item.id,
        [ServiceCompanyContactPersonOrderField.NAME]: `${item.userAccount.firstName} ${item.userAccount.lastName}`,
        [ServiceCompanyContactPersonOrderField.COMPANY]: item.companyName,
        photoUrl: item.userAccount.photoUrl,
        [ServiceCompanyContactPersonOrderField.EMAIL]:
          item.userAccount.contact.email || '-',
        [ServiceCompanyContactPersonOrderField.PHONE]:
          item.userAccount.contact.phone || '-',
        [ServiceCompanyContactPersonOrderField.SECONDARY_PHONE]:
          item.additionalInfo?.secondaryPhone || '-',
        [ServiceCompanyContactPersonOrderField.ROLE]:
          item.userAccount.roles.map((role) => convertToText(role)),
        [ServiceCompanyContactPersonOrderField.COMMENT_COUNT]: item,
        actions: item,
      }))
    : [];
