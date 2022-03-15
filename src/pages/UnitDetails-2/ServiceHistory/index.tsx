import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useTheme from '@mui/material/styles/useTheme';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {ServiceOrderType} from 'models/service-order';
import {ServiceOrderIcons} from 'components/ServiceOrderIcons';
import Grid from '@mui/material/Grid';

interface Props {
  bodyContainerStyle?: {[key: string]: string | number};
  minHeight?: number | string;
}

export const ServiceHistory = ({bodyContainerStyle, minHeight}: Props) => {
  const theme = useTheme();
  console.log(minHeight);
  return (
    <Grid
      container
      sx={{
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        pt: '1.5em',
        pb: '0.5em',
        ...bodyContainerStyle,
      }}
    >
      <Grid xs={3} item>
        <Box display="flex">
          <Typography variant="subtitle1">24 Sep 2021, </Typography>
          <Typography
            variant="body2"
            sx={{mt: '0.35em', color: theme.palette.text.secondary}}
          >
            {' '}
            {' 5PM - 6PM'}
          </Typography>
        </Box>
      </Grid>
      <Grid xs={2} item>
        <Box display="flex">
          <Box>
            <ServiceOrderIcons
              serviceOrderType={ServiceOrderType.REGULAR}
              style={{
                width: '0.8em',
                height: '0.8em',
                marginRight: '0.3em',
                mt: '0.2em',
              }}
            />
          </Box>
          <Box>
            <Typography variant="caption">Maintenance</Typography>
          </Box>
        </Box>
      </Grid>

      <Grid xs={5} item>
        <Typography variant="caption">
          Checked the inner shaft of the elevator engine door and did...
        </Typography>
      </Grid>

      <Grid xs={2} item>
        <Box display="flex" justifyContent="flex-end">
          <Box mr="0.4em">
            <Typography
              variant="chip"
              color={theme.palette.text.secondary}
              sx={{textTransform: 'capitalize'}}
            >
              Completed
            </Typography>
          </Box>
          <Box>
            <CheckCircleIcon
              color="success"
              sx={{mt: '0.3em', height: '0.833rem', width: '0.833rem'}}
            />
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};
