import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface Props {
  label: string;
}

export const EmptyItem = ({label}: Props) => (
  <Box display="flex" justifyContent="center" alignItems="center" height="100%">
    <Typography variant="h5">{label}</Typography>
  </Box>
);
