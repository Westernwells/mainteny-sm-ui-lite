import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {InfoCard} from 'components/InfoCard';

interface Props {
  containerStyles?: {[key: string]: any};
}

export const Notes = ({containerStyles}: Props) => (
  <InfoCard
    containerStyles={containerStyles}
    showHeaderBackground
    header={
      <Typography component="div" variant="subtitle1">
        Notes
      </Typography>
    }
    headerActionIcon={<Typography color="info.main">+Add</Typography>}>
    <Box>kdk</Box>
  </InfoCard>
);
