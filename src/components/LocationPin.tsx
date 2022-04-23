import {ReactElement} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {useNavigate} from 'react-router-dom';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import useTheme from '@mui/material/styles/useTheme';
import {ReactComponent as Pin} from '../assets/icons/Pin.svg';
import {ElevatorStatus, ElevatorView} from '../models/elevator';
import {formatDate} from '../utils/datetime';
import {StatusIndicator} from './StatusIndicator';

interface Props {
  elevator?: ElevatorView;
  lat: number;
  lng: number;
  children?: ReactElement;
}

export const LocationPin = ({
  elevator: elevatorItem,
  lat,
  lng,
  children,
}: Props) => {
  console.log(`lat = ${lat}, lng = ${lng}`);
  const theme = useTheme();
  const navigate = useNavigate();
  const renderTooltipDetail = (elevator: ElevatorView) => (
    <Box
      display="flex"
      flexDirection="column"
      style={{color: 'black'}}
      padding={1}>
      <Box display="flex">
        <Box>
          <Typography variant="caption" mt="1em">
            Company: <br />{' '}
            <Typography color="text.secondary">
              {elevator.propertyOwner.name}
            </Typography>
          </Typography>
        </Box>

        <Box>
          <StatusIndicator
            color={
              elevator.status === ElevatorStatus.RUNNING ? 'success' : 'error'
            }
            containerStyles={{ml: '5em'}}>
            <Typography variant="caption">
              {`${elevator.status.charAt(0)}${elevator.status
                .slice(1)
                .toLowerCase()}`}
            </Typography>
          </StatusIndicator>
        </Box>
      </Box>
      <Box display="flex" justifyContent="space-between" mt="1em">
        <Box>
          <Typography variant="caption">
            Elevator Address: <br />
            <Typography
              color="text.secondary"
              sx={{whiteSpace: 'wrap', width: '98%', display: 'inline-block'}}>
              {elevator.address.fullName}
            </Typography>
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" mt="1em">
            Capacity: <br />{' '}
            <Typography color="text.secondary">{elevator.capacity}</Typography>
          </Typography>
        </Box>
      </Box>
      <Box display="flex" justifyContent="space-between" mt="1em">
        <Box>
          <Typography variant="caption">
            Last Visit: <br />{' '}
            <Typography color="text.secondary">
              {' '}
              {formatDate(elevator.lastVisitDate)}
            </Typography>
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption">
            Next Visit: <br />
            {elevator.nextVisitDate && (
              <Typography color="text.secondary">
                {' '}
                {formatDate(elevator.nextVisitDate)}
              </Typography>
            )}
          </Typography>
        </Box>
      </Box>
      <Button
        variant="outlined"
        size="small"
        style={{marginTop: '2rem'}}
        onClick={() => navigate(`/units/details/${elevator.id}`)}>
        More details
      </Button>
    </Box>
  );
  return (
    <Box
      sx={{
        fill: () => theme.palette.common.white,
        stroke: () => theme.palette.divider,
        strokeWidth: 1,
      }}>
      {children || (
        <Box>
          <Tooltip
            componentsProps={{
              tooltip: {
                sx: {
                  bgcolor: 'common.white',
                  '& .MuiTooltip-arrow': {
                    color: 'common.black',
                  },
                },
              },
            }}
            title={renderTooltipDetail(elevatorItem!)}
            arrow
            placement="top">
            <Pin />
          </Tooltip>
        </Box>
      )}
    </Box>
  );
};
