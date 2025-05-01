import {GridColDef, GridRenderCellParams} from '@mui/x-data-grid';
import {getColumnProps} from 'components/DataGridLayout';
import {format} from 'date-fns';
import {StatusChip} from 'components/StatusChip';
import {getCompanyStatusStyles} from 'utils/company-utils';
import {
  ServiceCompanyItem,
  ServiceCompanyItemNew,
} from 'models/service-company';
import {CompanyStatus} from 'models/company';
import Actions, {IActions} from './Actions';

export const getColumns = ({
  onActivate,
  onDeactivate,
  onInternalSwitch,
  onLiveSwitch,
}: IActions): GridColDef[] => [
  getColumnProps({
    field: 'companyName',
    headerName: 'Company Name',
    align: 'left',
    flex: 1.5,
    cellClassName: 'truncateText',
  }),
  getColumnProps({
    field: 'country',
    headerName: 'Country',
    align: 'left',
    flex: 1,
  }),
  getColumnProps({
    field: 'noOfUsers',
    headerName: '# of users',
    align: 'left',
    flex: 1,
  }),
  getColumnProps({
    field: 'noOfLicense',
    headerName: '# of licences',
    align: 'left',
    flex: 1,
  }),
  getColumnProps({
    field: 'noOfSubLicense',
    headerName: '# of sub licences',
    align: 'left',
    flex: 1,
  }),
  getColumnProps({
    field: 'noOfSubUsers',
    headerName: '# of sub users',
    align: 'left',
    flex: 1,
  }),
  getColumnProps({
    field: 'created',
    headerName: 'Created',
    align: 'left',
    flex: 1.5,
  }),
  getColumnProps({
    field: 'lastActive',
    headerName: 'Last active',
    align: 'left',
    flex: 1,
  }),
  getColumnProps({
    field: 'status',
    sortable: true,
    headerName: 'status',
    align: 'center',
    headerAlign: 'center',
    renderCell: (params: GridRenderCellParams<any, any, any>) => (
      <StatusChip
        label={getCompanyStatusStyles(params.value).label}
        color={getCompanyStatusStyles(params.value).color}
        variant="filled"
        size="small"
        maxChars={9}
        style={{
          ...(params.value === CompanyStatus.DEACTIVATED && {color: 'black'}),
        }}
      />
    ),
    flex: 1,
  }),
  getColumnProps({
    field: 'actions',
    headerName: 'ACTIONS',
    flex: 1,
    headerAlign: 'center',
    align: 'center',
    renderCell: (params: GridRenderCellParams<ServiceCompanyItemNew>) => (
      <Actions
        companyId={params.row.id}
        onActivate={onActivate}
        onLiveSwitch={onLiveSwitch}
        onDeactivate={onDeactivate}
        onInternalSwitch={onInternalSwitch}
        status={params.row.status}
      />
    ),
  }),
];

export const makeRows = (companies: ServiceCompanyItem[]) =>
  companies
    ? companies.map((item) => ({
        id: item.id,
        companyName: item.name,
        created: format(new Date(item.meta.createdAt), 'dd.MM.yyyy') || '-',
        lastActive: item.statistics?.lastActivity
          ? format(new Date(item.statistics?.lastActivity), 'dd.MM.yyyy') || '-'
          : '-',
        status: item.settings.status,
        country: item?.businessAddress
          ? item?.businessAddress.component?.country
          : '-',
        noOfUsers: item.statistics?.numberOfMainUsers ?? '-',
        noOfLicense: item.settings?.userLimits?.maxMainUserCount ?? '-',
        noOfSubLicense: item.settings?.userLimits?.maxContractorCount ?? '-',
        noOfSubUsers: item.statistics?.numberOfContractors ?? '-',
        navigateTo: `details/${item.id}`,
      }))
    : [];
