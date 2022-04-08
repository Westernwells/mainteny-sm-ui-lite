import {useState} from 'react';
import {addDays, format} from 'date-fns';
import Box from '@mui/material/Box';

import Typography from '@mui/material/Typography';
import useTheme from '@mui/material/styles/useTheme';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import Grid from '@mui/material/Grid';
import {PageCard} from 'components/PageCard';
import {EmptySection} from 'components/EmptySection';
import * as _ from 'lodash';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import {Bar} from 'react-chartjs-2';

import {SplitButton} from '../../components/SplitButton';
import {formatDate} from '../../utils/datetime';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

interface Props {
  noStats?: boolean;
}

export const options = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    yAxes: {
      ticks: {
        min: 0,
        max: 600,
        stepSize: 200,
        lineWidth: 3,
      },
    },
  },
};

enum TimeFrame {
  LAST_7_DAYS = 'LAST 7 DAYS',
  LAST_14_DAYS = 'LAST 14 DAYS',
  LAST_21_DAYS = 'LAST 21 DAYS',
}

function formatDates(timeFrame: TimeFrame): Date[] {
  let number: number;
  switch (timeFrame) {
    case TimeFrame.LAST_7_DAYS: {
      number = 7;
      break;
    }
    case TimeFrame.LAST_14_DAYS: {
      number = 14;
      break;
    }
    case TimeFrame.LAST_21_DAYS: {
      number = 21;
      break;
    }
    default: {
      number = 7;
    }
  }

  const currentDate = new Date();
  const days: Date[] = [];
  for (let i = number; i > 0; i -= 1) {
    days.push(addDays(currentDate, -i));
  }
  return days;
}

function generateLabels(timeFrame: TimeFrame) {
  return formatDates(timeFrame).map((day) => day.getDate());
}

function generateData(timeFrame: TimeFrame) {
  return formatDates(timeFrame).map(() => _.random(100, 800));
}

export const ElevatorAvailabilitySection = ({noStats}: Props) => {
  const theme = useTheme();
  const [timeFrame, setTimeFrame] = useState(TimeFrame.LAST_7_DAYS);
  const barData = {
    labels: generateLabels(timeFrame),
    datasets: [
      {
        id: 1,
        label: 'Runs',
        data: generateData(timeFrame),
        backgroundColor: theme.palette.primary.main,
      },
    ],
  };

  function getStartDate(): Date {
    const days = formatDates(timeFrame);
    return days[0];
  }
  function getEndDate(): Date {
    const days = formatDates(timeFrame);
    return days[days.length - 1];
  }
  return (
    <PageCard headerLabel="Stats" minHeight="30rem">
      {!noStats ? (
        <EmptySection label="Stats will appear here if the unit is IoT enabled!" />
      ) : (
        <Box
          sx={{
            background: '#fff',
            borderRadius: '8px',
            height: '100%',
          }}>
          <Box sx={{px: '20px'}} pt="0.1em">
            <Box
              display="flex"
              sx={{
                px: '2em',
              }}>
              <Typography
                variant="h5"
                mr="0.5em"
                color={theme.palette.success.main}>
                98%
              </Typography>
              <Typography variant="caption" mr="3em" mt="0.3em" flexGrow={1}>
                Availability
              </Typography>
              <Typography variant="h5" mr="0.8em">
                17:21
              </Typography>
              <Typography variant="caption" mt="0.3em">
                {' '}
                Hours of Runtime
              </Typography>
            </Box>
            <Box width="100%">
              <Box mt="1em">
                <Bar data={barData} options={options} height={205} />
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                ml="70px"
                mr="35px">
                <Typography>{format(getStartDate(), 'MMM')}</Typography>
                <Typography>{format(getEndDate(), 'MMM')}</Typography>
              </Box>
            </Box>
          </Box>
          <Grid container sx={{pt: '1.5em', display: 'flex'}}>
            <Grid item sm={12} md={5}>
              <SplitButton
                size="small"
                selectedOption={timeFrame}
                options={[
                  TimeFrame.LAST_7_DAYS,
                  TimeFrame.LAST_14_DAYS,
                  TimeFrame.LAST_21_DAYS,
                ]}
                onSelectedOptionChanged={(value) =>
                  setTimeFrame(value as TimeFrame)
                }
              />
            </Grid>
            <Grid item sm={12} md={7}>
              <Box display="flex">
                <ArrowLeftIcon fontSize="large" />

                <Typography
                  variant="tableHeaderText"
                  sx={{color: theme.palette.text.secondary, mt: '0.5em'}}>
                  {`${formatDate(getStartDate())} - ${formatDate(
                    getEndDate(),
                  )}`}
                </Typography>

                <ArrowRightIcon fontSize="large" />
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}
    </PageCard>
  );
};
