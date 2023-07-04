import {
  GridColDef,
  GridColumnHeaderParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import {useTranslation} from 'react-i18next';
import i18next from 'i18next';
import Typography from '@mui/material/Typography';
import {getColumnProps} from 'components/DataGridLayout';
import {ServiceCompanyItem} from 'models/service-company';
import {contractTypeMap} from 'utils/contract-utils';
import {ContractNameTypes} from 'models/contract';
import {Actions} from './Actions';

export const columns: GridColDef[] = [
  getColumnProps({
    field: 'contractName',
    headerName: 'Name',
    flex: 1,
    headerAlign: 'left',
    variant: 'titleCase',
  }),
  getColumnProps({
    field: 'contractType',
    headerName: 'Type',
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
        contractNameTypes={params.row.contractNameTypes}
        contractNameType={params.row.contractNameType}
      />
    ),
  }),
];

export const makeRows = (company: ServiceCompanyItem): GridRowsProp =>
  company
    ? company.settings.contractNameTypes.map((item: ContractNameTypes) => ({
        id: item.name,
        contractName: item.name,
        contractType: i18next.t(contractTypeMap[item.type]),
        companyId: company.id,
        contractNameTypes: company.settings.contractNameTypes,
        contractNameType: item,
      }))
    : [];
