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
import {ElevatorAssignmentSimpleView} from 'models/elevator';
import {Tooltip} from 'components/Tooltip';
import {Info} from '@mui/icons-material';
import {useTranslation} from 'react-i18next';
import {convertToText} from 'utils/utils';

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

export const columns = (
  getEditableTechnician: (item: ElevatorAssignmentSimpleView) => void,
  getDeletableTechnician: (item: ElevatorAssignmentSimpleView) => void,
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
    renderHeader: (params: GridColumnHeaderParams) => {
      const {t} = useTranslation();
      return (
        <Box display="flex" alignItems="center">
          <Typography variant="subtitle2" color="textSecondary">
            {typeof params.colDef.headerName === 'string'
              ? convertToText(t(params.colDef.headerName))
              : params.colDef.headerName}
          </Typography>
          <Tooltip
            title={
              <Box>
                <Typography
                  sx={{color: 'primary.main', fontSize: '14px', mb: '0.5em'}}>
                  {t('Priority')}
                </Typography>
                <Typography
                  sx={{
                    color: 'text.primary',
                    fontSize: '12px',
                    lineHeight: '166%',
                  }}>
                  {t('Higher the number here, higher is the priority')}
                </Typography>
              </Box>
            }
            placement="bottom-end"
            componentsProps={{
              tooltip: {
                sx: {
                  bgcolor: 'white',
                  color: 'black',
                  boxShadow: '0px 3.59389px 8.08625px rgba(0, 0, 0, 0.1);',
                },
              },
            }}
            arrow={false}>
            <Info
              sx={{
                ml: '0.1em',
                width: '1.04rem',
                height: '1.04rem',
                color: 'action.active',
              }}
            />
          </Tooltip>
        </Box>
      );
    },
  },
  {
    field: 'actions',
    headerName: 'Actions',
    ...defaultAlignment,
    ...defaultProps,
    renderCell: (params) => (
      <Box sx={{display: 'flex'}}>
        <Box
          onClick={() => getEditableTechnician(params.value)}
          sx={{mr: '1em'}}>
          <EditIcon sx={{color: 'text.secondary'}} />
        </Box>
        <Box onClick={() => getDeletableTechnician(params.value)}>
          <DeleteIcon sx={{color: 'text.secondary'}} />
        </Box>
      </Box>
    ),
  },
];

export const makeRows = (
  maintainers: ElevatorAssignmentSimpleView[],
): GridRowsProp =>
  maintainers
    .sort((a, b) =>
      a.technician.userAccount.firstName.localeCompare(
        b.technician.userAccount.firstName,
      ),
    )
    .map((maintainer) => ({
      id: maintainer.technician.id,
      name: `${maintainer.technician.userAccount.firstName} ${maintainer.technician.userAccount.lastName}`,
      address: maintainer.technician.address.fullName,
      priority: maintainer.weight,
      actions: maintainer,
      navigateTo: `/employees/details/${maintainer.technician.userAccount.id}`,
    }));
