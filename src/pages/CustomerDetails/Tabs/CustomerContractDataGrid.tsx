import {
  GridColDef,
  GridColumnHeaderParams,
  GridRenderCellParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import {useTranslation} from 'react-i18next';
import Typography from '@mui/material/Typography';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import {formatDate} from 'utils/datetime';
import {ContractView} from 'models/contract';
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
  {
    field: 'actions',
    headerName: 'ACTIONS',
    // TODO: Actions not working as expected
    editable: false,
    sortable: false,
    disableColumnMenu: true,
    disableExport: true,
    flex: 0,
    headerAlign: 'center',
    align: 'center',

    renderHeader: (params) => {
      const {t} = useTranslation();
      return (
        <Typography variant="subtitle2" color="textSecondary">
          {params.colDef.headerName && t(params.colDef.headerName)}
        </Typography>
      );
    },
    renderCell: () => (
      <FileDownloadOutlinedIcon
        sx={{color: 'action.active'}}
        onClick={() => console.log('ACTION: Download')}
      />
    ),
  },
];

export const makeRows = (contracts: ContractView[]): GridRowsProp =>
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
    navigateTo: `/contracts/details/${item.id}`,
  }));
