import {Typography} from '@mui/material';
import {Box} from '@mui/system';
import {ElevatorDataItemView} from 'models/elevator';
import {useTranslation} from 'react-i18next';

interface Props {
  elevatorDataItems: ElevatorDataItemView[];
}

const TechnicalDataView = ({elevatorDataItems}: Props) => {
  const {t} = useTranslation();

  return (
    <Box>
      {elevatorDataItems.map((dataItem) => (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            my: 1.5,
          }}>
          <Typography fontWeight={400} color="#828DA3">
            {dataItem.name}
          </Typography>
          {dataItem.value && (
            <Typography fontWeight={400} color="#000034">
              {dataItem.value} {t(dataItem.unit)}
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default TechnicalDataView;
