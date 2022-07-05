import {Box, Grid, Typography} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {useTranslation} from 'react-i18next';
import {InfoCard} from 'components/InfoCard';
import WorkHourWidget from '../../WorkHours/WorkHourWidget';

type EmployeeWorkHoursProps = {
  action: () => void;
};

const EmployeeWorkHours = ({action}: EmployeeWorkHoursProps) => {
  const {t} = useTranslation();
  return (
    <Grid item xs={8}>
      <InfoCard
        header={<Typography variant="subtitle1">{t('Work Hours')}</Typography>}
        containerStyles={{flexGrow: 1}}
        headerStyles={{mt: '0.5em'}}
        handleAction={action}
        headerActionIcon={<OpenInNewIcon />}
        showHeaderBackground>
        <Box>
          <WorkHourWidget />
        </Box>
      </InfoCard>
    </Grid>
  );
};

export default EmployeeWorkHours;
