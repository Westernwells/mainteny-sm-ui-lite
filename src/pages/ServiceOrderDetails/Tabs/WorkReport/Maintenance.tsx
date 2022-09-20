import useTheme from '@mui/material/styles/useTheme';
import {Divider, Typography} from '@mui/material';
import Box from '@mui/material/Box';
import {FormLabel} from 'components/form/FormLabel';
import {addMinutes} from 'date-fns';
import {useFormatDate} from 'hooks/useFormatDate';
import {ServiceOrderReportView} from 'models/service-order';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {convertDigitalMinsToHM} from 'utils/datetime';

interface Props {
  serviceReport: ServiceOrderReportView;
}

const dateToString = (date: Date) =>
  date.toISOString().split('T')[1].split('.')[0];

export const Maintenance = ({serviceReport}: Props) => {
  const theme = useTheme();
  const [schedule] = useState(
    serviceReport.serviceOrder.schedules[
      serviceReport.serviceOrder.schedules.length - 1
    ],
  );
  const [endTime] = useState(
    addMinutes(
      new Date(serviceReport.serviceOrder.actualStartTime!),
      serviceReport.serviceOrder.serviceTime!,
    ),
  );
  const formatDate = useFormatDate();
  const {t} = useTranslation();

  return (
    <Box mt="1em">
      <FormLabel text="Maintenance" />
      {schedule && (
        <Box
          bgcolor="grey.50"
          border="1px solid"
          borderColor="grey.300"
          borderRadius="4px"
          p=".5em">
          <Box
            px="1em"
            py=".75em"
            sx={{
              display: 'grid',
              gridTemplateColumns: '8ch 1fr 4fr',
              placeItems: 'start',
              gap: '.5em',
            }}>
            <FormLabel text="" />
            <FormLabel text="Date" sx={{justifySelf: 'start'}} />
            <FormLabel text="Time" />
          </Box>
          <Box
            bgcolor="grey.50"
            boxShadow="0px 4px 15px 0px #90909033"
            px=".5em">
            {[
              {
                label: t('Start'),
                date: formatDate(serviceReport.serviceOrder.actualStartTime),
                time: dateToString(
                  new Date(serviceReport.serviceOrder.actualStartTime!),
                ),
              },
              {
                label: t('End'),
                date: formatDate(serviceReport.serviceOrder.actualEndTime),
                time: dateToString(new Date(endTime)),
              },
            ].map((i) => (
              <Box
                key={i.label}
                px=".5em"
                py="1em"
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '8ch 1fr 4fr',
                  placeItems: 'start',
                  gap: '.5em',
                }}>
                <Typography variant="body2">{i.label}</Typography>
                <Typography variant="body2">{i.date}</Typography>
                <Typography variant="body2">{i.time}</Typography>
              </Box>
            ))}
          </Box>
          <Divider
            sx={{
              my: '1rem',
              border: `1px solid ${theme.palette.action.disabledBackground}`,
            }}
          />
          <Box
            bgcolor="grey.700"
            borderRadius="4px"
            p="1em"
            mb=".5em"
            pl="50%"
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              justifyItems: 'end',
            }}>
            <Typography sx={{color: 'primary.contrastText'}}>
              {t('Total Time')}
            </Typography>
            <Typography sx={{color: 'primary.contrastText'}}>
              {convertDigitalMinsToHM(serviceReport.actualServiceTime)}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};
