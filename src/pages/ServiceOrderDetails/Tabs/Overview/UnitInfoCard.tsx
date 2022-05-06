import {useRef} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {BasicDetailsCard} from 'components/BasicDetailsCard';
import useTheme from '@mui/material/styles/useTheme';
import {convertToText} from 'utils/utils';
import Button from '@mui/material/Button';
import {CardProps} from 'components/CardProps';
import {ServiceOrder} from 'models/service-order';
import {unitInfo as unitInfoSchema} from './schema';

interface Props {
  serviceOrderDetails: ServiceOrder;
}

export const UnitInfoCard = ({serviceOrderDetails}: Props) => {
  const theme = useTheme();
  const unitInfo = useRef(unitInfoSchema(serviceOrderDetails)).current;
  return (
    <BasicDetailsCard
      header={
        <Box>
          <Typography variant="subtitle1">Unit Info</Typography>
        </Box>
      }>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        }}>
        {Object.values(unitInfo).map((item, index) => (
          <CardProps
            key={`${index}`}
            label={item.label}
            icon={item.icon}
            bodyText={convertToText(item.value!)}
            containerStyles={{mb: '0.5em', width: '27%'}}
            iconMaxHeight="3rem"
            iconBackground={theme.palette.info.outlinedHoverBg}
          />
        ))}
      </Box>
      <Button variant="contained" size="small" sx={{px: '2.5em', mt: '1em'}}>
        Schedule
      </Button>
    </BasicDetailsCard>
  );
};
