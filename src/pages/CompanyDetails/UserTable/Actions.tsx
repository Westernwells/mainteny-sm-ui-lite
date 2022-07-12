import IconButton from '@mui/material/IconButton';
import {Edit, SupervisedUserCircle} from '@mui/icons-material';
import {Box, Typography} from '@mui/material';
import {Tooltip} from 'components/Tooltip';

interface Props {
  onEdit: () => void;
  onGetUserToken: () => void;
}

export const Actions = ({onEdit, onGetUserToken}: Props) => (
  <Box>
    <IconButton component="a" onClick={onGetUserToken}>
      <Tooltip
        title={
          <Box>
            <Typography sx={{color: 'white', fontSize: '12px'}}>
              Impersonate
            </Typography>
          </Box>
        }
        placement="bottom-start"
        componentsProps={{
          tooltip: {
            sx: {
              bgcolor: 'common.black',
              color: 'white',
              boxShadow: '0px 3.59389px 8.08625px rgba(0, 0, 0, 0.1);',
              '& .MuiTooltip-arrow': {
                color: 'common.black',
              },
            },
          },
        }}
        arrow>
        <SupervisedUserCircle sx={{color: 'action.active'}} fontSize="small" />
      </Tooltip>
    </IconButton>
    <IconButton component="a" onClick={onEdit}>
      <Edit sx={{color: 'action.active'}} fontSize="small" />
    </IconButton>
  </Box>
);
