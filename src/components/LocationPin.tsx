import {ReactElement} from 'react';
import Box, {BoxProps} from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {useNavigate} from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip';
import {useFormatDate} from 'hooks/useFormatDate';
import {useTranslation} from 'react-i18next';
import {ReactComponent as Pin} from '../assets/icons/Pin.svg';
import {ElevatorStatus, ElevatorView} from '../models/elevator';
import {StatusIndicator} from './StatusIndicator';
import {Button} from './Button';

interface Props extends BoxProps {
  elevator?: ElevatorView;
  lat: number;
  lng: number;
  children?: ReactElement;
}

export const LocationPin = ({
  elevator: elevatorItem,
  lat, // eslint-disable-line
  lng /* eslint-disable-line */, //we had to disable this rule, we do not need this props but react google maps require us to pass it
  children,
}: Props) => {
  const {t} = useTranslation();
  const formatDate = useFormatDate();
  const navigate = useNavigate();
  const renderTooltipDetail = (elevator: ElevatorView) => (
    <Box
      component="div"
      display="flex"
      flexDirection="column"
      style={{color: 'black'}}
      padding={1}>
      {console.log('@@@@@')}
      <Box display="flex" justifyContent="space-between">
        <Box sx={{flexGrow: 1}}>
          <Typography variant="caption" mt="1em">
            {t('Company:')} <br />
            <Typography
              color="text.secondary"
              sx={{whiteSpace: 'wrap', mr: '0.5em'}}>
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
              {t(
                `${elevator.status.charAt(0)}${elevator.status
                  .slice(1)
                  .toLowerCase()}`,
              )}
            </Typography>
          </StatusIndicator>
        </Box>
      </Box>
      <Box display="flex" justifyContent="space-between" mt="1em">
        <Box sx={{flexGrow: 1}}>
          <Typography variant="caption">
            {t('Elevator Address:')} <br />
            <Typography
              color="text.secondary"
              sx={{whiteSpace: 'wrap', mr: '0.5em'}}>
              {elevator.address.fullName}
            </Typography>
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" mt="1em">
            {t('Capacity:')} <br />
            <Typography color="text.secondary">{elevator.capacity}</Typography>
          </Typography>
        </Box>
      </Box>
      <Box display="flex" justifyContent="space-between" mt="1em">
        <Box sx={{flexGrow: 1}}>
          <Typography variant="caption">
            {t('Last Visit:')} <br />
            <Typography color="text.secondary">
              {formatDate(elevator.lastVisitDate)}
            </Typography>
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption">
            {t('Next Visit:')} <br />
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
        label="More details"
        buttonProps={{
          variant: 'outlined',
          size: 'small',
          sx: {marginTop: '2rem'},
          onClick: () => navigate(`/units/details/${elevator.id}`),
        }}
      />
    </Box>
  );
  return (
    <Box>
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
            <Box width="2rem" height="2rem">
              <Pin style={{width: '100%', height: '100%'}} />
            </Box>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
};
