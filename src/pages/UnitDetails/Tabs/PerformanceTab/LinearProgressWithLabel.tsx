import {
  Box,
  LinearProgress,
  LinearProgressProps,
  Typography,
} from '@mui/material';

export const LinearProgressWithLabel = ({
  value,
  ...props
}: LinearProgressProps) => (
  <Box display="flex" alignItems="center">
    <Box width="100%" mr={1}>
      <LinearProgress variant="determinate" value={value} {...props} />
    </Box>
    <Box minWidth={35}>
      <Typography variant="body2" color="textSecondary">{`${Math.round(
        value || 0,
      )}%`}</Typography>
    </Box>
  </Box>
);
