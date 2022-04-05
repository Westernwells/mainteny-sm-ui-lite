import {
  GridAlignment,
  GridColDef,
  GridColumnHeaderParams,
  GridRenderCellParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import Typography from '@mui/material/Typography';
import ReplyAllIcon from '@mui/icons-material/ReplyAll';
import EditIcon from '@mui/icons-material/Edit';
import MoreIcon from '@mui/icons-material/MoreVert';
import useTheme from '@mui/material/styles/useTheme';
import {StatusChip} from 'components/StatusChip';
import {formatDate} from 'utils/datetime';
import {QuotationStatus} from 'models/quotation';

const defaultProps = {
  editable: false,
  renderHeader: (params: GridColumnHeaderParams) => (
    <Typography variant="tableHeaderText" color="textSecondary">
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
    field: 'number',
    headerName: 'QUOTATION NO',
    type: 'string',
    flex: 1,
    headerAlign: 'left',
    ...defaultProps,
  },
  {
    field: 'customer',
    headerName: 'CUSTOMER NAME',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'address',
    headerName: 'ADDRESS',
    type: 'string',
    flex: 1,
    headerAlign: 'left',
    ...defaultProps,
  },
  {
    field: 'createdDate',
    headerName: 'CREATED DATE',
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
      <Typography variant="tableHeaderText" color="textSecondary">
        {params.colDef.headerName}
      </Typography>
    ),
    renderCell: (params: GridRenderCellParams<any, any, any>) => {
      const theme = useTheme();
      return (
        <StatusChip
          label={params.value === QuotationStatus.SENT ? 'Sent' : 'Draft'}
          bgColor={
            params.value === QuotationStatus.SENT
              ? theme.palette.success.main
              : theme.state?.ratingActive
          }
        />
      );
    },
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
      <Typography variant="tableHeaderText" color="textSecondary">
        {params.colDef.headerName}
      </Typography>
    ),
    renderCell: (params) => (
      <>
        {params.row.status === 'SENT' ? (
          <ReplyAllIcon
            sx={{color: '#2196F3'}}
            onClick={() => console.log('ACTION: Download')}
          />
        ) : (
          <EditIcon
            sx={{color: '#2196F3'}}
            onClick={() => console.log('ACTION: Download')}
          />
        )}
        <MoreIcon
          sx={{color: '#2196F3', marginLeft: '.5em'}}
          onClick={() => console.log('ACTION: Download')}
        />
      </>
    ),
  },
];

export const makeRows = (quotations: any): GridRowsProp =>
  quotations
    ? quotations.map((item: any, index: number) => ({
        id: index,
        number: item.number,
        customer: item.propertyOwner.name,
        address: item.propertyOwner.address.fullName,
        createdDate: formatDate(item.createdDate),
        status: item.status,
        navigateTo: item.id,
      }))
    : console.error('No Data');
