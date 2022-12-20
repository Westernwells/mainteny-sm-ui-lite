import {
  GridColDef,
  GridColumnHeaderParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import {useTranslation} from 'react-i18next';
import Typography from '@mui/material/Typography';
import {getColumnProps} from 'components/DataGridLayout';
import {ServiceCompanyItem} from 'models/service-company';
import {Actions} from './Actions';

export const columns: GridColDef[] = [
  getColumnProps({
    field: 'contractType',
    headerName: 'Name',
    flex: 1,
    headerAlign: 'left',
    variant: 'titleCase',
  }),
  getColumnProps({
    field: 'actions',
    headerName: 'Actions',
    align: 'right',
    headerAlign: 'left',
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
        id={params.row.companyId}
        contractTypes={params.row.contractTypes}
        contractType={params.row.contractType}
      />
    ),
  }),
];

export const makeRows = (company: ServiceCompanyItem): GridRowsProp =>
  company
    ? company.settings.contractTypes.map((item: string) => ({
        id: item,
        companyId: company.id,
        contractTypes: company.settings.contractTypes,
        contractType: item,
      }))
    : [];
