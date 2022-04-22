import {
  GridAlignment,
  GridColDef,
  GridColumnHeaderParams,
  GridRenderCellParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import Typography from '@mui/material/Typography';
import {DataGridLayout} from 'components/DataGridLayout';
import {Box} from '@mui/system';
import {ArticleView} from '../model';

interface Props {
  setRowItem: (row: ArticleView) => void;
}

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
    field: 'articleNumber',
    headerName: 'ARTICLE NO',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'type',
    headerName: 'TYPE',
    type: 'string',
    flex: 2,
    headerAlign: 'left',
    ...defaultProps,
  },
  {
    field: 'model',
    headerName: 'MODEL',
    type: 'string',
    flex: 2,
    headerAlign: 'left',
    ...defaultProps,
  },
  {
    field: 'manifacturer',
    headerName: 'MANUFACTURER',
    type: 'string',
    flex: 2,
    headerAlign: 'left',
    ...defaultProps,
  },
  {
    field: 'description',
    headerName: 'DESCRIPTION',
    type: 'string',
    flex: 2,
    headerAlign: 'left',
    ...defaultProps,
  },
  {
    field: 'unitPrice',
    headerName: 'UNIT PRICE',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
  },
];

const rows: GridRowsProp = [
  {
    id: 1,
    articleNumber: 'AT-5829400',
    type: 'Cable',
    model: 'Petersen Cable',
    manifacturer: 'Mitsubuishi',
    description: 'Renew hanging cable',
    unitPrice: '€ 7,700',
    unitPriceNumber: 7700,
    quantity: 1,
  },
  {
    id: 2,
    articleNumber: 'AT-4850213',
    type: 'Control Board',
    model: 'Thysennkrup',
    manifacturer: 'KONE',
    description: 'Main control board renewal',
    unitPrice: '€ 4,200',
    unitPriceNumber: 4200,
    quantity: 1,
  },
  {
    id: 3,
    articleNumber: 'AT-8197401',
    type: 'Elevator Control',
    model: 'Hyundai ',
    manifacturer: 'OTIS',
    description: 'Renew elevator control ',
    unitPrice: '€ 5,032',
    unitPriceNumber: 5032,
    quantity: 1,
  },
  {
    id: 4,
    articleNumber: 'AT-4819471',
    type: 'Cabinet',
    model: 'Fantek FTT10',
    manifacturer: 'Delfar Systems',
    description: 'Main control board renewal',
    unitPrice: '€ 729',
    unitPriceNumber: 729,
    quantity: 1,
  },
  {
    id: 5,
    articleNumber: 'AT-4184108',
    type: 'System Hang',
    model: 'Petersen Cable',
    manifacturer: '3M',
    description: 'Installation and Inspection control of Junction box',
    unitPrice: '€ 333',
    unitPriceNumber: 333,
    quantity: 1,
  },
];

export const ArticleDataGrid = ({setRowItem}: Props) => (
  <Box display="flex" flexGrow={1}>
    <DataGridLayout
      rows={rows}
      columns={columns}
      onCellClick={(params) => setRowItem(params.row)}
      hideFooter
    />
  </Box>
);
