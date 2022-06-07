import {
  GridAlignment,
  GridColDef,
  GridColumnHeaderParams,
  GridRenderCellParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import useTheme from '@mui/material/styles/useTheme';
import Typography from '@mui/material/Typography';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import {formatCurrency} from 'utils/currency';
import {formatDate} from 'utils/datetime';
import {ContractStatus, ContractView} from 'models/contract';
import {StatusChip} from 'components/StatusChip';
import {convertToText} from 'utils/utils';

const defaultProps = {
  editable: false,
  renderHeader: (params: GridColumnHeaderParams) => (
    <Typography variant="subtitle2" color="textSecondary">
      {params.colDef.headerName}
    </Typography>
  ),
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
    headerName: 'CONTRACT ID',
    type: 'string',
    flex: 1,
    headerAlign: 'left',
    ...defaultProps,
  },
  {
    field: 'units',
    headerName: 'NUMBER OF UNITS',
    type: 'number',
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'cost',
    headerName: 'COST/YEAR',
    type: 'number',
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'startDate',
    headerName: 'START DATE',
    type: 'string',
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

  {
    field: 'contractType',
    headerName: 'CONTRACT TYPE',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
  },

  {
    field: 'status',
    headerName: 'STATUS',
    type: 'string',
    ...defaultAlignment,
    editable: false,
    renderHeader: (params: GridColumnHeaderParams) => (
      <Typography variant="subtitle2" color="textSecondary">
        {params.colDef.headerName}
      </Typography>
    ),
    renderCell: (params: GridRenderCellParams<any, any, any>) => {
      const theme = useTheme();
      switch (params.value) {
        case ContractStatus.VALID:
          return (
            <StatusChip
              label={convertToText(ContractStatus.VALID)}
              color="success"
            />
          );
        case ContractStatus.PENDING:
          return (
            <StatusChip
              label={convertToText(ContractStatus.PENDING)}
              style={{color: theme.state.ratingActive}}
            />
          );
        default:
          return (
            <StatusChip
              label={convertToText(ContractStatus.EXPIRED)}
              color="error"
            />
          );
      }
    },
  },

  {
    field: 'contractType',
    headerName: 'CONTRACT TYPE',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
  },

  {
    field: 'actions',
    headerName: 'ACTIONS',
    // TODO: Actions not working as expected
    // type: 'actions',
    // getActions: (params: GridRowParams) => [
    //   <GridActionsCellItem
    //     icon={<FileDownloadOutlinedIcon sx={{color: '#2196F3'}} />}
    //     onClick={() => console.log('ACTION: Click', params.id)}
    //     label="Download"
    //   />,
    // ],
    editable: false,
    sortable: false,
    disableColumnMenu: true,
    disableExport: true,
    ...defaultAlignment,

    renderHeader: (params) => (
      <Typography variant="subtitle2" color="textSecondary">
        {params.colDef.headerName}
      </Typography>
    ),
    renderCell: () => (
      <FileDownloadOutlinedIcon
        sx={{color: '#2196F3'}}
        onClick={() => console.log('ACTION: Download')}
      />
    ),
  },
];

export const makeRows = (contracts: any): GridRowsProp =>
  contracts
    ? contracts.map((item: ContractView, index: number) => ({
        id: index,
        contractNumber: item.number,
        units: item.units || '-',
        cost: `${formatCurrency(item ? item.price! : 0, {
          currency: item.currency,
        })}`,
        status: item.status,
        contractType: item.type[0] + item.type.slice(1).toLowerCase(),
        startDate: formatDate(item.startTime),
        expiryDate: formatDate(item.endTime),
        navigationData: {path: 'details', id: item.id},
      }))
    : [];
