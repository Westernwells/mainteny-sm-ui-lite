import {GridColDef} from '@mui/x-data-grid';
import {getColumnProps} from 'components/DataGridLayout';
import {FormatDate} from 'models/misc';
import {ServiceCompanyItem} from 'models/service-company';

export const columns: GridColDef[] = [
  getColumnProps({
    field: 'name',
    headerName: 'Name',
    align: 'left',
    flex: 1,
  }),
  getColumnProps({
    field: 'email',
    headerName: 'email',
    align: 'left',
    flex: 1,
  }),
  getColumnProps({
    field: 'phone',
    headerName: 'PHONE',
    align: 'left',
    flex: 1,
  }),
  getColumnProps({
    field: 'website',
    headerName: 'WEBSITE',
    align: 'left',
    flex: 1.5,
  }),
  getColumnProps({
    field: 'address',
    headerName: 'BILLING ADDRESS',
    align: 'left',
    flex: 1.5,
  }),
  getColumnProps({
    field: 'createdOn',
    headerName: 'CREATED ON',
    align: 'left',
    flex: 1,
  }),
];

export const makeRows = (
  companies: ServiceCompanyItem[],
  formatDate: FormatDate = () => '',
) =>
  companies
    ? companies.map((item, index) => ({
        id: index,
        name: item?.name,
        email: item?.contact?.email || '-',
        phone: item?.contact?.phone || '-',
        address: item?.billingAddress?.fullName || '-',
        createdOn: formatDate(item?.meta?.createdAt) || '-',
        website: item?.contact?.url || '-',
        navigateTo: `details/${item.id}`,
      }))
    : [];
