import {Box, Typography} from '@mui/material';
import {ElevatorDataSchemaView} from 'models/elevator';
import {useTranslation} from 'react-i18next';
import {getTechnicalFieldName} from 'utils/utils';

interface Props {
  schema: ElevatorDataSchemaView;
}

export const ViewTechnicalData = ({schema}: Props) => {
  const {t} = useTranslation();

  return (
    <Box sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>
      <Box sx={{overflowY: 'auto', maxHeight: '45vh', pt: 0}}>
        {schema.additionalInfo.items.map((item, index) => (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
            key={index}
            mb={1}>
            <Typography color="#828DA3">
              {getTechnicalFieldName({name: item.name}, t)}
            </Typography>
            <Typography color="#000034" fontWeight="bold">
              {t(item.unit)}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
