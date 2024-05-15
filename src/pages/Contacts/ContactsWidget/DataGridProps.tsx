import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import {GridColDef, GridRenderCellParams, GridRowsProp} from '@mui/x-data-grid';
import {getColumnProps} from 'components/DataGridLayout';
import {
  RefContactPersonView,
  ServiceCompanyContactPersonOrderField,
} from 'models/contacts';
import {Resource, State} from 'models/misc';
import {useTranslation} from 'react-i18next';
import {convertToText} from 'utils/utils';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';

interface Props {
  onEdit: (id: RefContactPersonView) => void;
  onDelete: (contact: RefContactPersonView) => void;
}
export const getColumns = ({onEdit, onDelete}: Props): GridColDef[] => [
  getColumnProps({
    field: ServiceCompanyContactPersonOrderField.NAME,
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
        }}>
        {params.value}
      </Typography>
    ),
  }),
  getColumnProps({
    field: ServiceCompanyContactPersonOrderField.COMPANY,
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
    field: ServiceCompanyContactPersonOrderField.PHONE,
    headerName: 'PHONE',
    flex: 1,
    headerAlign: 'left',
  }),
  getColumnProps({
    field: ServiceCompanyContactPersonOrderField.SECONDARY_PHONE,
    headerName: 'PHONE 2',
    flex: 1,
    headerAlign: 'left',
  }),
  getColumnProps({
    field: ServiceCompanyContactPersonOrderField.EMAIL,
    headerName: 'EMAIL ADDRESS',
    flex: 2,
    headerAlign: 'left',
    renderCell: (params: GridRenderCellParams<any, any, any>) => (
      <Link
        href={`mailto:${params.value}`}
        underline="none"
        target="_blank"
        onClick={(e) => e.stopPropagation()}
        sx={{wordBreak: 'break-all', whiteSpace: 'wrap'}}>
        <Typography
          variant="body2"
          sx={{
            wordBreak: 'break-all',
            whiteSpace: 'wrap',
            color: 'primary.light',
          }}>
          {params.value}
        </Typography>
      </Link>
    ),
  }),
  getColumnProps({
    field: ServiceCompanyContactPersonOrderField.ROLE,
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
    field: 'actions',
    headerName: '',
    align: 'right',
    flex: 0.3,
    renderCell: (params: GridRenderCellParams<RefContactPersonView>) => {
      const contact = params.value;
      return (
        <Box sx={{display: 'flex', alignItems: 'center'}}>
          <IconButton
            onClick={(event) => {
              event.stopPropagation();
              onEdit(contact);
            }}
            size="small">
            <EditOutlinedIcon sx={{color: 'secondary.mainLight'}} />
          </IconButton>
          <IconButton
            onClick={(event) => {
              event.stopPropagation();
              onDelete(contact);
            }}
            size="small">
            <DeleteOutlinedIcon sx={{color: 'secondary.mainLight'}} />
          </IconButton>
        </Box>
      );
    },
  }),
];

export const makeRows = (
  contacts: Resource<RefContactPersonView> | undefined,
): GridRowsProp =>
  contacts && contacts.data.length
    ? contacts.data
        ?.filter((el) => el.meta.state !== State.DELETED)
        ?.map((item: RefContactPersonView) => ({
          id: item?.id,
          [ServiceCompanyContactPersonOrderField.NAME]: `${item.userAccount.firstName} ${item.userAccount.lastName}`,
          [ServiceCompanyContactPersonOrderField.COMPANY]: item.companyName,
          [ServiceCompanyContactPersonOrderField.EMAIL]:
            item.userAccount.contact.email || '-',
          [ServiceCompanyContactPersonOrderField.PHONE]:
            item.userAccount.contact.phone || '-',
          [ServiceCompanyContactPersonOrderField.SECONDARY_PHONE]:
            item.additionalInfo?.secondaryPhone || '-',
          [ServiceCompanyContactPersonOrderField.ROLE]:
            item.userAccount.roles.map((role) => convertToText(role)),
          actions: item,
          contact: item,
        }))
    : [];
