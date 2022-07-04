import {Typography} from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';
import {Chart, registerables} from 'chart.js';
import {Line} from 'react-chartjs-2';
import {addDays, format} from 'date-fns';
import {random} from 'lodash';
import {InfoCard} from 'components/InfoCard';

Chart.register(...registerables);

const getDays = (number: number) => {
  const currentDate = new Date();
  const days: Date[] = [];
  for (let i = number; i > 0; i -= 1) {
    days.push(addDays(currentDate, -i));
  }
  return days;
};

export const PerformanceAnalytics = () => {
  const theme = useTheme();

  const lineChartData = {
    labels: getDays(7).map((day) => format(day, 'EEEEEE')),
    datasets: [
      {
        id: 1,
        data: getDays(7).map(() => random(10, 40)),
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.inputBackground.main,
        borderRadius: 4,
        pointBackgroundColor: theme.palette.primary.main,
        pointBorderColor: 'transparent',
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: theme.palette.primary.main,
        lineTension: 0.8,
        fill: true,
      },
    ],
  };

  const label = (context: {formattedValue: string}) => [
    `${context.formattedValue}hr`,
    'Total runtime',
  ];

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label,
        },
      },
      legend: {
        display: false,
        labels: {
          usePointStyle: true,
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
          max: 40,
          stepSize: 10,
          lineWidth: 3,
        },
      },
    },
  };
  return (
    <InfoCard
      containerStyles={{
        height: '100%',
        [theme.breakpoints.up('md')]: {
          minHeight: '15.5rem',
        },
      }}
      header={
        <Typography variant="subtitle2" color={theme.palette.action.active}>
          Performance Analytics
        </Typography>
      }
      showHeaderBackground>
      <Line data={lineChartData} options={options} height={205} />
    </InfoCard>
  );
};
