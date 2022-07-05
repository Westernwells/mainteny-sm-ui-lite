import {
  Box,
  CircularProgress,
  CircularProgressProps,
  Typography,
} from '@mui/material';

export const CircularProgressWithLabel = ({
  value,
  containerStyle,
  ...props
}: CircularProgressProps & {
  value: number;
  containerStyle?: {[key: string]: any};
}) => (
  <Box sx={{position: 'relative', display: 'inline-flex', ...containerStyle}}>
    <CircularProgress variant="determinate" value={value} {...props} />
    <Box
      sx={{
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Typography
        variant="h5"
        component="div"
        color="text.secondary">{`${Math.round(value)}%`}</Typography>
    </Box>
  </Box>
);
