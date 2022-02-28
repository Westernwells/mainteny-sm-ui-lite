import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useTheme from '@mui/material/styles/useTheme';
import Divider from '@mui/material/Divider';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {ScrollableCard} from 'components/ScrollableCard';
import {ReactComponent as Elevation} from '../../assets/icons/Elevation.svg';
import {ReactComponent as ArrowDownward} from '../../assets/icons/ArrowDownward.svg';
// import {breakDownHistoryResource} from '../../hooks/reactQuery/useIssueHistory';
import {formatDate} from '../../utils/datetime';

interface Props {
  elevatorId?: string;
}

// TODO: Using dummy data here
const breakdownHistory = [
  {
    id: '1',
    datetime: '2021-11-02T00:00:00Z',
    durationInMinutes: 240,
    status: 'Resolved',
    description: 'Blocked door in 2nd floor',
  },
  {
    id: '2',
    datetime: '2021-10-29T00:00:00Z',
    durationInMinutes: 120,
    status: 'Resolved',
    description: 'Controller error',
  },
  {
    id: '3',
    datetime: '2021-08-11T00:00:00Z',
    durationInMinutes: 240,
    status: 'Resolved',
    description: 'Broken roller',
  },
];

// TODO: we do not have the model in backend yet
export const ElevatorBreakDownSection = ({elevatorId}: Props) => {
  const theme = useTheme();
  return (
    <ScrollableCard
      renderIcon={() => <Elevation />}
      showMoreBtn
      renderHeaderText={() => (
        <Typography variant="h6">
          Breakdown History ({breakdownHistory.length})
        </Typography>
      )}
    >
      <Box pt={2}>
        {breakdownHistory.map((history) => (
          <Box
            key={history.id}
            sx={{
              background: '#F7F9FC',
              borderRadius: '4px',
              pt: 2,
              pb: 3,
              px: 3,
              mb: 2,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                pt: '24px',
                pb: '5px',
              }}
            >
              <Typography variant="h6" mr={3}>
                {formatDate(history.datetime)}
              </Typography>
              <Box display="flex" alignItems="center">
                <ArrowDownward />
                <Typography variant="largeBtnText">
                  {history.durationInMinutes / 60}h
                </Typography>
                <Typography variant="body2" color="#8F9BB3">
                  &nbsp;downtime
                </Typography>
              </Box>
              <Box mt={1} display="flex">
                <Typography variant="largeBtnText">{history.status}</Typography>
                <CheckCircleIcon color="success" />
              </Box>
            </Box>
            <Divider sx={{mt: 1}} />
            <Typography pb={1} pt={1}>
              {history.description}
            </Typography>
          </Box>
        ))}
      </Box>
    </ScrollableCard>
  );
};
