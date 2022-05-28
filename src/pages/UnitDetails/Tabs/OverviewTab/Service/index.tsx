import {PageCard} from 'components/PageCard';
import Typography from '@mui/material/Typography';
import useTheme from '@mui/material/styles/useTheme';
import EditIcon from '@mui/icons-material/Edit';
import {Elevator} from 'models/elevator';
import Grid from '@mui/material/Grid';
import {useRef} from 'react';
import {ServiceSchema} from './ServiceSchema';

interface Props {
  containerStyles?: {[key: string]: any};
  elevator: Elevator;
}

export const Service = ({containerStyles, elevator}: Props) => {
  const theme = useTheme();
  const labels = useRef([
    'lastVisit',
    'lastInspection',
    'visitsPerYear',
    'requiredTime',
    'numOfTechnicians',
    'unitPriority',
  ]).current;

  return (
    <PageCard
      containerStyles={{...containerStyles}}
      customHeader={<Typography variant="subtitle1">Service</Typography>}
      headerActionIcon={<EditIcon />}
      headerContainerOverrideStyles={{
        py: '0.2em',
        background: theme.palette.inputBackground.main,
      }}>
      <Grid container spacing={2}>
        {labels.map((label) => (
          <Grid key={label} item xs={12} sm={4} md={6}>
            <ServiceSchema label={label} elevator={elevator} />
          </Grid>
        ))}
      </Grid>
    </PageCard>
  );
};
