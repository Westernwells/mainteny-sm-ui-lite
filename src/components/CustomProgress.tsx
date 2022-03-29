import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

interface Props {
  size?: number;
}

export const CustomProgress = ({size}: Props) => (
  <Box sx={{display: 'flex'}}>
    <CircularProgress size={size || 30} />
  </Box>
);
