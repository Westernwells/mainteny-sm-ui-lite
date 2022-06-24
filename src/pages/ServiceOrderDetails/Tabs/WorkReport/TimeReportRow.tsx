/* eslint-disable */
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {Button} from 'components/Button';
import DeleteIcon from '@mui/icons-material/Delete';

export const TimeReportRow = () => {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '7ch repeat(2, 15ch)',
        p: '1em',
      }}>
      <Typography variant="body2">Start</Typography>
      <Typography variant="body2">03.01.2022</Typography>
      <Typography variant="body2">08:30</Typography>
    </Box>
  );
};
