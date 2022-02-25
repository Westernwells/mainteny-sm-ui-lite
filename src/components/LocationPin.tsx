import React from 'react';
import Chip from '@mui/material/Chip';
import Box from '@mui/system/Box';
import Slide from '@mui/material/Slide';
import Typography from '@mui/material/Typography';
import {useNavigate} from 'react-router-dom';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import useTheme from '@mui/material/styles/useTheme';
import {ReactComponent as Pin} from '../assets/icons/Pin.svg';
import {Location} from '../models/misc';
import {ElevatorsByAddress} from '../pages/Units/Models';
import {ElevatorStatus} from '../models/elevator';
import {formatDate} from '../utils/datetime';

interface Props {
  elevatorsByAddress: ElevatorsByAddress;
  lat: number;
  lng: number;
  onPinClick: () => void;
  selectedLocation?: Location;
}

export const LocationPin = ({
  elevatorsByAddress,
  lat,
  lng,
  onPinClick,
  selectedLocation,
}: Props) => {
  console.log(`lat = ${lat}, lng = ${lng}`);
  // TODO: there are multiple elevators sharing the same address, pick the first one for demo
  const elevatorOrderPair = elevatorsByAddress.elevators[0];
  const theme = useTheme();
  const navigate = useNavigate();
  const renderTooltipDetail = () => (
    <Box
      display="flex"
      flexDirection="column"
      style={{color: 'black'}}
      padding={1}
    >
      <Box display="flex">
        <Box>
          <Typography variant="subtitle2">
            {elevatorOrderPair.elevator.address.fullName}
          </Typography>
          <Typography variant="subtitle2">
            {elevatorOrderPair.elevator.capacity}
          </Typography>
        </Box>
        <Box>
          <Chip
            sx={{py: 2}}
            label={
              <Typography
                variant="largeBtnText"
                sx={{textTransform: 'capitalize'}}
              >
                {`${elevatorOrderPair.elevator.status.charAt(
                  0,
                )}${elevatorOrderPair.elevator.status.slice(1).toLowerCase()}`}
              </Typography>
            }
            color={
              elevatorOrderPair.elevator.status === ElevatorStatus.RUNNING
                ? 'success'
                : 'error'
            }
            size="medium"
          />
        </Box>
      </Box>
      <Box display="flex" justifyContent="space-between">
        <Box>
          <Typography variant="subtitle2">Last Visit:</Typography>
          <Typography variant="subtitle2">
            {formatDate(elevatorOrderPair.elevator.lastVisitDate)}
          </Typography>
        </Box>
        <Box>
          <Typography variant="subtitle2">Next Visit:</Typography>
          {elevatorOrderPair.serviceOrder && (
            <Typography variant="subtitle2">
              {formatDate(
                elevatorOrderPair.serviceOrder.schedules[0].startTime,
              )}
            </Typography>
          )}
        </Box>
      </Box>
      <Button
        variant="outlined"
        size="small"
        style={{marginTop: '2rem'}}
        onClick={() => navigate(`/units/${elevatorOrderPair.elevator.id}`)}
      >
        More details
      </Button>
    </Box>
  );
  return (
    <Box
      onClick={onPinClick}
      sx={{
        fill: () => theme.palette.common.white,
        stroke: () => theme.palette.divider,
        strokeWidth: 1,
      }}
    >
      <Slide direction="down" timeout={700} in unmountOnExit>
        <Box>
          {selectedLocation?.longitude ===
          elevatorOrderPair.elevator.address.location.longitude ? (
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
              title={renderTooltipDetail()}
              arrow
              placement="top"
            >
              <Pin />
            </Tooltip>
          ) : (
            <Pin />
          )}
        </Box>
      </Slide>
    </Box>
  );
};
