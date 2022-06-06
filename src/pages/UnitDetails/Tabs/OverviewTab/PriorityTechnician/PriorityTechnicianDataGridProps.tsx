import {
  GridAlignment,
  GridColDef,
  GridColumnHeaderParams,
  GridRenderCellParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Box from '@mui/material/Box';
import {MaintainerView} from 'models/technician';

const defaultProps = {
  editable: false,
  sortable: false,
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
  headerAlign: 'left',
  align: 'left',
};

export const columns = (
  getClickedTechnician: (item: MaintainerView) => void,
): GridColDef[] => [
  {
    field: 'name',
    headerName: 'NAME',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
    flex: 2,
  },
  {
    field: 'address',
    headerName: 'ADDRESS',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
    flex: 2,
  },
  {
    field: 'priority',
    headerName: 'PRIORITY',
    type: 'number',
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'actions',
    headerName: 'EXPIRY DATE',
    type: 'number',
    ...defaultAlignment,
    ...defaultProps,
    renderCell: (params) => (
      <Box sx={{display: 'flex'}}>
        <Box onClick={() => getClickedTechnician(params.value)}>
          <EditIcon sx={{color: 'text.secondary'}} />
        </Box>
        <Box onClick={() => getClickedTechnician(params.value)}>
          <DeleteIcon sx={{color: 'text.secondary'}} />
        </Box>
      </Box>
    ),
  },
];

export const makeRows = (maintainers: MaintainerView[]): GridRowsProp =>
  maintainers.map((maintainer) => ({
    id: maintainer.technician.id,
    name: `${maintainer.technician.userAccount.firstName} ${maintainer.technician.userAccount.lastName}`,
    address: maintainer.technician.address.fullName,
    priority: maintainer.weight,
    actions: maintainer,
  }));
