import {
  GridAlignment,
  GridColDef,
  GridColumnHeaderParams,
  GridRenderCellParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import {useTranslation} from 'react-i18next';
import Typography from '@mui/material/Typography';
import {formatDate} from 'utils/datetime';
import {ContractView} from 'models/contract';
import {formatNetAmount} from '../../../../../utils/currency';

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

export const columns: GridColDef[] = [
  {
    field: 'contractNumber',
    headerName: 'Contract ID',
    type: 'string',
    flex: 1,
    headerAlign: 'left',
    ...defaultProps,
  },

  {
    field: 'cost',
    headerName: 'Revenue/Year',
    type: 'number',
    ...defaultAlignment,
    ...defaultProps,
  },

  {
    field: 'expiryDate',
    headerName: 'EXPIRY DATE',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
  },
];

export const makeRows = (contracts: any): GridRowsProp =>
  contracts
    ? contracts.data.map((item: ContractView, index: number) => ({
        id: index,
        contractNumber: item.number,
        cost: formatNetAmount(item.additionalInfo.price) || '-',
        expiryDate: formatDate(item.endTime),
        navigateTo: `/contracts/details/${item.id}`,
      }))
    : console.error('No Data');
