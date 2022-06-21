import {Typography} from '@mui/material';
import Box from '@mui/material/Box';
import useTheme from '@mui/material/styles/useTheme';

type TotalTimeProps = {
  time: string;
};

const TotalTime = ({time}: TotalTimeProps) => {
  const theme = useTheme();

  return (
    <Box
      display="flex"
      sx={{
        height: '2.5rem',
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'right',
        [theme.breakpoints.down('md')]: {
          flexWrap: 'wrap',
          justifyContent: 'center',
        },
      }}>
      <Typography
        component="span"
        variant="caption"
        sx={{
          [theme.breakpoints.up('md')]: {
            marginRight: '10px',
          },
          color: ' #8F9BB3',
          fontSize: '14px',
          lineHeight: '20px',
          fontWeight: '600',
        }}>
        Total time
      </Typography>
      <Typography
        component="span"
        variant="caption"
        sx={{
          fontSize: '13px',
          lineHeight: '18px',
          color: '#0F4C6480',
          border: '1px solid #0F4C6480',
          borderRadius: '16px',
          padding: '3px 4px',
        }}>
        {time}
      </Typography>
    </Box>
  );
};

export default TotalTime;
