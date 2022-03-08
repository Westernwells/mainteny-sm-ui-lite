import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {StatusChip} from 'components/StatusChip';
import {CardAlert} from 'components/CardAlert';
import {formatDistance} from 'date-fns';
import {PageCard} from 'components/PageCard';
import useTheme from '@mui/material/styles/useTheme';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import {Elevator, ElevatorStatus} from '../../models/elevator';
import {ServiceOrder, ServiceOrderView} from '../../models/service-order';
import {formatDate} from '../../utils/datetime';

import {calculateNextVisitDate} from '../Units/Models';

export interface ElevatorBasicSectionProp {
  elevator?: Elevator;
  serviceOrder?: ServiceOrder | ServiceOrderView;
  rows: {[key: string]: any}[];
}

export const ElevatorBasicSection = ({
  elevator,
  serviceOrder,
  rows,
}: ElevatorBasicSectionProp) => {
  const theme = useTheme();
  return (
    <PageCard headerLabel="Unit Details">
      {rows.map((item, index) => (
        <Box
          key={`${item}-${index}`}
          display="flex"
          mt={index !== 0 ? '1.3em' : undefined}
        >
          <Box
            display="flex"
            width="15rem"
            flexGrow={index === 0 ? 1 : 'unset'}
          >
            <Box mr="0.5em" mt="0.3em">
              <Box
                sx={{background: theme.palette.background.default}}
                width="3rem"
                height="2.8rem"
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                {item.leftIcon}
              </Box>
            </Box>
            <Box>
              <Typography
                variant={index === 0 ? 'subtitle1' : 'caption'}
                color={
                  index === 0
                    ? theme.palette.primary.main
                    : theme.palette.text.secondary
                }
              >
                {item.leftLabel}
              </Typography>
              <Typography
                variant={index === 0 ? 'caption' : 'body1'}
                color={theme.palette.primary.main}
              >
                {item.leftValue}
              </Typography>
            </Box>
          </Box>

          {index === 0 ? (
            <StatusChip
              label={elevator ? elevator.status : ''}
              color={
                elevator?.status === ElevatorStatus.RUNNING
                  ? 'success'
                  : 'error'
              }
            />
          ) : (
            <Box display="flex" width="15rem" ml="3em">
              <Box mr="0.5em" mt="0.3em">
                <Box
                  sx={{background: theme.palette.background.default}}
                  width="3rem"
                  height="2.8rem"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                >
                  {item.rightIcon}
                </Box>
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  color={theme.palette.text.secondary}
                >
                  {item.rightLabel}
                </Typography>
                <Typography variant="body1" color={theme.palette.primary.main}>
                  {item.rightValue}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      ))}

      {serviceOrder && (
        <CardAlert
          alertIcon={<CalendarTodayIcon />}
          message={`Upcoming visit in 
        ${formatDistance(
          calculateNextVisitDate(serviceOrder.schedules[0].startTime),
          new Date(),
        )}
        (${formatDate(
          calculateNextVisitDate(serviceOrder.schedules[0].startTime),
          'dd MMM YYY',
        )})`}
        />
      )}
    </PageCard>
  );
};
