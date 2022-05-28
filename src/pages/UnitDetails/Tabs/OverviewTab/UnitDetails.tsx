import {PageCard} from 'components/PageCard';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import useTheme from '@mui/material/styles/useTheme';
import EditIcon from '@mui/icons-material/Edit';
import {Elevator} from 'models/elevator';
import {UnitDetailsSchema} from './UnitDetailsSchema';

interface Props {
  containerStyles?: {[key: string]: any};
  elevator: Elevator;
}

export const UnitDetails = ({containerStyles, elevator}: Props) => {
  const theme = useTheme();
  const unitDetailsLabels = [
    'category',
    'manufacturer',
    'unitId',
    'stops',
    'cabinType',
    'phone',
    'unitType',
    'model',
    'serialNumber',
    'unitCapacity',
    'spendingLimit',
  ];

  return (
    <PageCard
      containerStyles={{...containerStyles}}
      customHeader={<Typography variant="subtitle1">Unit Details</Typography>}
      headerActionIcon={<EditIcon />}
      headerContainerOverrideStyles={{
        py: '0.2em',
        background: theme.palette.inputBackground.main,
      }}>
      <Grid container spacing={2}>
        {unitDetailsLabels.map((label) => (
          <Grid item xs={12} sm={4} md={6}>
            <UnitDetailsSchema label={label} elevator={elevator} />
          </Grid>
        ))}
      </Grid>
    </PageCard>
  );
};
