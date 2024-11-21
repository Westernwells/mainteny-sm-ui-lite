import {
  GridAlignment,
  GridColDef,
  GridColumnHeaderParams,
  GridRenderCellParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import Typography from '@mui/material/Typography';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import Box from '@mui/material/Box';
import {ElevatorAssignmentSimpleView} from 'models/elevator';
import {useTranslation} from 'react-i18next';
import {theme} from 'theme';
import {sortTechniciansByPriority} from 'utils/elevator-utils';

const defaultProps = (isLink: boolean) => ({
  editable: false,
  sortable: false,
  renderHeader: (params: GridColumnHeaderParams) => {
    const {t} = useTranslation();
    return (
      <Typography variant="subtitle2" color="textSecondary">
        {typeof params.colDef.headerName === 'string' &&
          t(params.colDef.headerName)}
      </Typography>
    );
  },
  renderCell: (params: GridRenderCellParams<any, any, any>) => (
    <Typography
      variant="body2"
      mx="0.5em"
      sx={{color: isLink ? theme.palette.primary.light : 'inherit'}}>
      {params.value}
    </Typography>
  ),
});
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
  getEditableTechnician: (item: ElevatorAssignmentSimpleView) => void,
  getDeletableTechnician: (item: ElevatorAssignmentSimpleView) => void,
): GridColDef[] => [
  {
    field: 'name',
    headerName: 'SERVICE NAME',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps(true),
    flex: 2,
  },
  {
    field: 'number',
    headerName: 'ENGINEER ID',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps(false),
    flex: 2,
  },
  {
    field: 'address',
    headerName: 'ADDRESS',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps(false),
    flex: 2,
  },
  {
    field: 'priority',
    headerName: 'PRIORITY',
    type: 'number',
    ...defaultAlignment,
    ...defaultProps(false),
    align: 'right',
    headerAlign: 'right',
  },
  {
    field: 'actions',
    headerName: '',
    ...defaultAlignment,
    ...defaultProps(false),
    align: 'right',
    headerAlign: 'right',
    renderCell: (params) => (
      <Box sx={{display: 'flex'}}>
        <Box
          onClick={() => getEditableTechnician(params.value)}
          sx={{mr: '1em'}}>
          <EditOutlinedIcon
            style={{color: theme.palette.secondary.mainLight}}
          />
        </Box>
        <Box onClick={() => getDeletableTechnician(params.value)}>
          <DeleteOutlinedIcon
            style={{color: theme.palette.secondary.mainLight}}
          />
        </Box>
      </Box>
    ),
  },
];

export const makeRows = (
  maintainers: ElevatorAssignmentSimpleView[],
): GridRowsProp =>
  maintainers.sort(sortTechniciansByPriority).map((maintainer) => ({
    id: maintainer.technician.id,
    number: maintainer.technician.externalId,
    name: `${maintainer.technician.userAccount.firstName} ${maintainer.technician.userAccount.lastName}`,
    address: maintainer.technician.address.fullName,
    priority: maintainer.weight,
    actions: maintainer,
    navigateTo: `/employees/details/${maintainer.technician.userAccount.id}`,
  }));
