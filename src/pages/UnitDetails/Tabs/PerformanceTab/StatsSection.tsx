import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {addDays, format} from 'date-fns';
import * as _ from 'lodash';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useTheme from '@mui/material/styles/useTheme';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import Grid from '@mui/material/Grid';
import {InfoCard} from 'components/InfoCard';
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

import {Button, ButtonGroup} from '@mui/material';
import {useFormatDate} from 'hooks/useFormatDate';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

export const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      align: 'end' as const,
      boxWidth: 12,
      labels: {
        usePointStyle: true,
        pointStyle: 'rectRounded',
      },
    },
  },
  scales: {
    xAxes: {
      grid: {
        display: false,
      },
    },
    yAxes: {
      grid: {
        display: false,
      },
      ticks: {
        max: 600,
        stepSize: 200,
        lineWidth: 3,
      },
    },
  },
};

enum TimeFrame {
  LAST_7_DAYS = 'LAST 7 DAYS',
  LAST_30_DAYS = 'LAST 30 DAYS',
  LAST_365_DAYS = 'LAST 365 DAYS',
}

function formatDates(timeFrame: TimeFrame): Date[] {
  let number: number;
  switch (timeFrame) {
    case TimeFrame.LAST_7_DAYS: {
      number = 7;
      break;
    }
    case TimeFrame.LAST_30_DAYS: {
      number = 30;
      break;
    }
    case TimeFrame.LAST_365_DAYS: {
      number = 365;
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
  return formatDates(timeFrame).map(() => _.random(100, 600));
}

export const StatsSection = () => {
  const formatDate = useFormatDate();
  const theme = useTheme();
  const {t} = useTranslation();
  const [timeFrame, setTimeFrame] = useState(TimeFrame.LAST_7_DAYS);
  const barData = {
    labels: generateLabels(timeFrame),
    datasets: [
      {
        id: 1,
        label: t('Runs'),
        data: generateData(timeFrame),
        backgroundColor: theme.palette.primary.main,
        borderRadius: 4,
        barThickness: 25,
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

  const primaryStyle = {bgcolor: theme.palette.text.primary};
  const secondaryStyle = {bgcolor: theme.palette.text.secondary};

  return (
    <InfoCard
      containerStyles={{
        [theme.breakpoints.up('md')]: {
          minHeight: '24.5rem',
        },
      }}
      header={
        <Typography variant="subtitle2" color={theme.palette.action.active}>
          {t('Stats')}
        </Typography>
      }
      showHeaderBackground>
      <Grid container gap={2} flexGrow={1}>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item xs={7} display="flex" alignItems="center">
            <ArrowLeftIcon fontSize="large" color="action" />

            <Typography
              variant="tableHeaderText"
              sx={{color: theme.palette.text.secondary}}>
              {`${formatDate(getStartDate())} - ${formatDate(getEndDate())}`}
            </Typography>

            <ArrowRightIcon fontSize="large" color="action" />
          </Grid>
          <Grid item xs={5}>
            <ButtonGroup variant="contained" size="small">
              <Button
                onClick={() => setTimeFrame(TimeFrame.LAST_7_DAYS)}
                sx={
                  timeFrame === TimeFrame.LAST_7_DAYS
                    ? primaryStyle
                    : secondaryStyle
                }>
                {t('Week')}
              </Button>
              <Button
                onClick={() => setTimeFrame(TimeFrame.LAST_30_DAYS)}
                sx={
                  timeFrame === TimeFrame.LAST_30_DAYS
                    ? primaryStyle
                    : secondaryStyle
                }>
                {t('Month')}
              </Button>
              <Button
                onClick={() => setTimeFrame(TimeFrame.LAST_365_DAYS)}
                sx={
                  timeFrame === TimeFrame.LAST_365_DAYS
                    ? primaryStyle
                    : secondaryStyle
                }>
                {t('Year')}
              </Button>
            </ButtonGroup>
          </Grid>
        </Grid>
        <Grid container alignItems="center">
          <Grid
            item
            xs={6}
            display="flex"
            justifyContent="center"
            alignItems="center"
            gap={1}>
            <Typography variant="h5">17:21</Typography>
            <Typography variant="caption">{t('Hours of Runtime')}</Typography>
          </Grid>
          <Grid
            item
            xs={6}
            display="flex"
            justifyContent="center"
            alignItems="center"
            gap={1}>
            <Typography variant="h5" color={theme.palette.success.main}>
              98%
            </Typography>
            <Typography variant="caption">{t('Availability')}</Typography>
          </Grid>
        </Grid>
        <Grid container justifyContent="center">
          <Grid item xs={10}>
            <Box>
              <Bar data={barData} options={options} height={205} />
            </Box>
            <Box
              display="flex"
              justifyContent="space-between"
              ml="70px"
              mr="35px">
              <Typography variant="caption">
                {format(getStartDate(), 'MMM')}
              </Typography>
              <Typography variant="caption">
                {format(getEndDate(), 'MMM')}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </InfoCard>
  );
};
