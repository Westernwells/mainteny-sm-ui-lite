import {PageCard} from 'components/PageCard';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import useTheme from '@mui/material/styles/useTheme';
import EditIcon from '@mui/icons-material/Edit';
import {Elevator} from 'models/elevator';
import Grid from '@mui/material/Grid';
import {useRef} from 'react';
import {LocationSchema} from './LocationSchema';

interface Props {
  containerStyles?: {[key: string]: any};
  elevator: Elevator;
}

export const Location = ({containerStyles, elevator}: Props) => {
  const theme = useTheme();
  const locationLabels = useRef([
    'address',
    'building',
    'propertySegment',
    'keyLocation',
    'parking',
  ]).current;

  return (
    <PageCard
      containerStyles={{...containerStyles}}
      customHeader={<Typography variant="subtitle1">Location</Typography>}
      headerActionIcon={<EditIcon />}
      headerContainerOverrideStyles={{
        py: '0.2em',
        background: theme.palette.inputBackground.main,
      }}>
      <Box
        sx={{
          display: 'flex',
          background: theme.palette.secondary.outlinedHoverBg,
          py: '1em',
          px: '0.5em',
          mb: '0.5em',
        }}>
        <Avatar alt="Tech" sx={{mr: '0.5em'}} />
        <Box>
          <Typography variant="subtitle2" component="div">
            {elevator.propertyOwner.name}
          </Typography>
          <Typography variant="caption" component="div">
            Property Manager
          </Typography>
        </Box>
      </Box>
      <Grid container spacing={2}>
        {locationLabels.map((label) => (
          <Grid item xs={12} sm={4} md={12}>
            <LocationSchema label={label} elevator={elevator} />
          </Grid>
        ))}
      </Grid>
    </PageCard>
  );
};
