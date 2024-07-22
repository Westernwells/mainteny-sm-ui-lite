import {Box, Grid, Typography} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {useTranslation} from 'react-i18next';
import {InfoCard} from 'components/InfoCard';
import EmployeeWorkHourWidget from './EmployeeWorkHourWidget';

type EmployeeWorkHoursProps = {
  action: () => void;
};

const EmployeeWorkHours = ({action}: EmployeeWorkHoursProps) => {
  const {t} = useTranslation();
  return (
    <Grid item sm={12} md={6} lg={9}>
      <InfoCard
        header={<Typography variant="subtitle1">{t('Work Hours')}</Typography>}
        containerStyles={{flexGrow: 1}}
        headerStyles={{mt: '0.5em'}}
        handleAction={action}
        headerActionIcon={<OpenInNewIcon />}
        showHeaderBackground>
        <Box>
          <EmployeeWorkHourWidget />
        </Box>
      </InfoCard>
    </Grid>
  );
};

export default EmployeeWorkHours;
