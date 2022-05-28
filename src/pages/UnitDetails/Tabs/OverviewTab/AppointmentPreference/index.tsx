import {PageCard} from 'components/PageCard';
import Typography from '@mui/material/Typography';
import useTheme from '@mui/material/styles/useTheme';
import EditIcon from '@mui/icons-material/Edit';
import {Elevator} from 'models/elevator';
import Grid from '@mui/material/Grid';
import {AppointmentPreferenceSchema} from './AppointmentPreferenceSchema';

interface Props {
  containerStyles?: {[key: string]: any};
  elevator: Elevator;
}

export const AppointmentPreference = ({containerStyles, elevator}: Props) => {
  const theme = useTheme();

  return (
    <PageCard
      containerStyles={{...containerStyles}}
      customHeader={
        <Typography variant="subtitle1">Appointment Preferences</Typography>
      }
      headerActionIcon={<EditIcon />}
      headerContainerOverrideStyles={{
        py: '0.2em',
        background: theme.palette.inputBackground.main,
      }}>
      <Grid container spacing={2}>
        {elevator.properties.map((property) => (
          <Grid key={property.key} item xs={12} sm={4} md={6}>
            <AppointmentPreferenceSchema
              label={property.key}
              property={property}
            />
          </Grid>
        ))}
      </Grid>
    </PageCard>
  );
};
