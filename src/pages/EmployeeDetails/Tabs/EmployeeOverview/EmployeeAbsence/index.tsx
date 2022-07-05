import {Box, Grid, Typography} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import {InfoCard} from 'components/InfoCard';
import {useTranslation} from 'react-i18next';

const EmployeeAbsence = () => {
  const {t} = useTranslation();
  return (
    <Grid item xs={4}>
      <InfoCard
        header={<Typography variant="subtitle1">{t('Absence')}</Typography>}
        containerStyles={{flexGrow: 1}}
        headerStyles={{mt: '0.5em'}}
        headerActionIcon={<AddIcon />}
        showHeaderBackground>
        {/* TODO: Create Absence component */}
        <Box> </Box>
      </InfoCard>
    </Grid>
  );
};

export default EmployeeAbsence;
