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
  spendingLimit?: number;
  currency?: string;
}

export const UnitDetails = ({
  containerStyles,
  elevator,
  spendingLimit,
  currency,
}: Props) => {
  const theme = useTheme();
  const labels = [
    'category',
    'unitType',
    'manufacturer',
    'model',
    'unitId',
    'serialNumber',
    'stops',
    'unitCapacity',
    'cabinType',
    'spendingLimit',
    'phone',
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
        {labels.map((label) => (
          <Grid key={label} item xs={12} sm={4} md={6}>
            <UnitDetailsSchema
              label={label}
              elevator={elevator}
              spendingLimit={spendingLimit}
              currency={currency}
            />
          </Grid>
        ))}
      </Grid>
    </PageCard>
  );
};
