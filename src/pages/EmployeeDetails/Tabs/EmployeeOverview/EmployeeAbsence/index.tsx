import {Box, Grid, Typography} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import {InfoCard} from 'components/InfoCard';

const EmployeeAbsence = () => (
  <Grid item xs={4}>
    <InfoCard
      header={<Typography variant="subtitle1">Absence</Typography>}
      containerStyles={{flexGrow: 1}}
      headerStyles={{mt: '0.5em'}}
      headerActionIcon={<AddIcon />}
      showHeaderBackground>
      {/* TODO: Create Absence component */}
      <Box> </Box>
    </InfoCard>
  </Grid>
);

export default EmployeeAbsence;
