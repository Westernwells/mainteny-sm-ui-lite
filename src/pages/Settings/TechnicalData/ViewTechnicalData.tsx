import {Box, Typography} from '@mui/material';
import {ElevatorDataSchemaView} from 'models/elevator';

interface Props {
  schema: ElevatorDataSchemaView;
}

export const ViewTechnicalData = ({schema}: Props) => (
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
          <Typography color="#828DA3">{item.name}</Typography>
          <Typography color="#000034" fontWeight="bold">
            {item.unit}
          </Typography>
        </Box>
      ))}
    </Box>
  </Box>
);
