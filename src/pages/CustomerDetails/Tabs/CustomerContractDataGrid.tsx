import {
  GridColDef,
  GridColumnHeaderParams,
  GridRenderCellParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import {useTranslation} from 'react-i18next';
import Typography from '@mui/material/Typography';
import {FormatDate} from 'models/misc';
import {ContractView} from 'models/contract';
import {Actions} from 'pages/Contracts/Actions';
import {getColumnProps} from 'components/DataGridLayout';
import {formatNetAmount} from '../../../utils/currency';

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

export const columns: GridColDef[] = [
  {
    field: 'contractNumber',
    headerName: 'CONTRACT ID',
    type: 'string',
    flex: 1,
    headerAlign: 'left',
    ...defaultProps,
  },
  {
    field: 'customer',
    headerName: 'CUSTOMER',
    type: 'string',
    flex: 1.5,
    headerAlign: 'left',
    align: 'left',
    ...defaultProps,
  },
  {
    field: 'units',
    headerName: 'NUMBER OF UNITS',
    type: 'number',
    flex: 0.75,
    headerAlign: 'center',
    align: 'center',
    ...defaultProps,
  },
  {
    field: 'startDate',
    headerName: 'START DATE',
    type: 'string',
    flex: 0.75,
    headerAlign: 'left',
    align: 'left',
    ...defaultProps,
  },
  {
    field: 'expiryDate',
    headerName: 'EXPIRY DATE',
    type: 'string',
    flex: 0.75,
    headerAlign: 'left',
    align: 'left',
    ...defaultProps,
  },
  {
    field: 'contractType',
    headerName: 'CONTRACT TYPE',
    type: 'string',
    flex: 0.75,
    headerAlign: 'left',
    align: 'left',
    ...defaultProps,
  },
  {
    field: 'cost',
    headerName: 'COST/YEAR',
    type: 'number',
    flex: 0.5,
    headerAlign: 'right',
    align: 'right',
    ...defaultProps,
  },
  getColumnProps({
    field: 'actions',
    headerName: 'actions',
    align: 'center',
    renderCell: (params) => (
      <Actions
        url={params.value.url}
        fileName={params.value.fileName}
        contractId={params.value.contractId}
      />
    ),
  }),
];

export const makeRows = (
  contracts: ContractView[],
  formatDate: FormatDate = () => '',
): GridRowsProp =>
  contracts.map((item: ContractView, index: number) => ({
    id: index,
    contractNumber: item.number,
    customer: item.propertyOwner.name,
    units: item.elevators.length,
    startDate: formatDate(item.startTime),
    expiryDate: formatDate(item.endTime),
    contractType: item.type[0] + item.type.slice(1).toLowerCase(),
    cost: formatNetAmount(item.additionalInfo.price) || '-',
    status: item.status,
    actions: {
      url:
        item?.additionalInfo?.documents &&
        item?.additionalInfo?.documents.length > 0
          ? item?.additionalInfo?.documents[0].uri
          : '',
      fileName:
        item?.additionalInfo?.documents &&
        item?.additionalInfo?.documents?.length > 0
          ? item?.additionalInfo?.documents[0]?.description
          : 'contract',
      contractId: item.id,
    },
    navigateTo: `/contracts/details/${item.id}`,
  }));
