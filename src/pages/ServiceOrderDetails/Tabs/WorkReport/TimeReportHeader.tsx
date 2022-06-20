/* eslint-disable */
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {Button} from 'components/Button';
import DeleteIcon from '@mui/icons-material/Delete';

export const TimeReportHeader = () => {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '7ch repeat(2, 15ch)',
        px: '1em',
      }}>
      <Typography variant="caption">{null}</Typography>
      <Typography variant="caption">Date</Typography>
      <Typography variant="caption">Time</Typography>
    </Box>
  );
};
