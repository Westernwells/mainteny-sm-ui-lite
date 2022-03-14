import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import useTheme from '@mui/material/styles/useTheme';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

interface Props {
  alertIcon?: JSX.Element;
  message: string;
  status?: 'error' | 'info' | 'success' | 'warning';
}

export const CardAlert = ({alertIcon, message, status}: Props) => {
  const theme = useTheme();
  return (
    <Box>
      <Alert
        sx={{mt: '2em'}}
        icon={alertIcon || <CalendarTodayIcon />}
        severity={status || 'info'}>
        <Typography variant="chip" color={theme.palette.info.infoAlert}>
          {message}
        </Typography>
      </Alert>
    </Box>
  );
};
