import {
  GridAlignment,
  GridColDef,
  GridColumnHeaderParams,
  GridRenderCellParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import Typography from '@mui/material/Typography';
import {StatusChip} from 'components/StatusChip';
import {convertToText} from 'utils/utils';
import {ContractSimpleView} from 'models/contract';
import {useTranslation} from 'react-i18next';
import {FormatDate} from 'models/misc';
import {getContractStatusStyles} from 'utils/contract-utils';

const defaultProps = {
  editable: false,
  sortable: false,
  renderHeader: (params: GridColumnHeaderParams) => {
    const {t} = useTranslation();
    return (
      <Typography variant="subtitle2" color="textSecondary">
        {typeof params.colDef.headerName === 'string'
          ? convertToText(t(params.colDef.headerName))
          : params.colDef.headerName}
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
  headerAlign: 'left',
  align: 'left',
};

export const columns: GridColDef[] = [
  {
    field: 'number',
    headerName: 'NUMBER',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'contractType',
    headerName: 'CONTRACT TYPE',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'startDate',
    headerName: 'START DATE',
    type: 'number',
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'expiryDate',
    headerName: 'EXPIRY DATE',
    type: 'number',
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'status',
    headerName: 'STATUS',
    disableColumnMenu: true,
    disableExport: true,
    ...defaultAlignment,
    ...defaultProps,
    renderCell: (params) => (
      <StatusChip
        label={getContractStatusStyles(params.value).label}
        color={getContractStatusStyles(params.value).color}
        variant="filled"
        maxChars={8}
      />
    ),
  },
];

export const makeRows = (
  contracts: ContractSimpleView[],
  formatDate: FormatDate = () => '',
): GridRowsProp =>
  contracts.map((item: ContractSimpleView) => ({
    id: item.id,
    number: item.externalId,
    contractType: convertToText(item.type),
    startDate: formatDate(new Date(item.start)) || '-',
    expiryDate: formatDate(new Date(item.end)) || '-',
    status: item.status,
    navigateTo: `/contracts/details/${item.id}`,
  }));
