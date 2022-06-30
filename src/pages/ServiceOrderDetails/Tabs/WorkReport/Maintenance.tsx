import {Typography} from '@mui/material';
import Box from '@mui/material/Box';
import {FormLabel} from 'components/form/FormLabel';
import {ServiceOrderSchedule} from 'models/service-order';
import {formatDate} from 'utils/datetime';

interface Props {
  schedule?: ServiceOrderSchedule;
}

const dateToString = (date: Date) =>
  date.toISOString().split('T')[1].split('.')[0];

export const Maintenance = ({schedule}: Props) => (
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
        <Box bgcolor="grey.50" boxShadow="0px 4px 15px 0px #90909033" px=".5em">
          {[
            {
              label: 'Start',
              date: formatDate(schedule.startTime),
              time: dateToString(new Date(schedule.startTime)),
            },
            {
              label: 'End',
              date: formatDate(schedule.endTime),
              time: dateToString(new Date(schedule.endTime)),
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
      </Box>
    )}
  </Box>
);
