import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import {InfoCard} from 'components/InfoCard';
import {useTranslation} from 'react-i18next';
import XeroIntegration from './XeroIntegration';

export interface IIntegrationInfo {
  title: string;
  description: string;
  icon: JSX.Element;
}

const Integrations = () => {
  const {t} = useTranslation();

  return (
    <InfoCard
      header={<Typography variant="subtitle1">{t('Integrations')}</Typography>}
      showHeaderBackground
      containerStyles={{
        mt: 1.5,
        height: '100%',
      }}>
      <Grid container direction="column" gap={2}>
        <XeroIntegration />
        {/* Add more integrations here */}
      </Grid>
    </InfoCard>
  );
};

export default Integrations;
