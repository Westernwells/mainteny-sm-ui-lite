import {EditOutlined, CloseOutlined} from '@mui/icons-material';

import {IconButton, InputAdornment} from '@mui/material';
import {Box} from '@mui/system';
import {FormInput} from 'components/form/FormInput';
import {ElevatorDataSchemaItem} from 'models/elevator';
import {useTranslation} from 'react-i18next';

type Props = {
  data: ElevatorDataSchemaItem;
  onEdit: () => void;
  onDelete: () => void;
};

const TechFieldEditDelete = ({data, onEdit, onDelete}: Props) => {
  const {t} = useTranslation();

  return (
    <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
      <FormInput
        containerStyles={{
          '& .MuiInputLabel-root': {
            color: 'black !important',
          },
          '& .MuiInputBase-root': {
            height: 40,
          },
          '& .MuiInputBase-input': {
            textAlign: data.unit ? 'right' : 'left',
          },
          '& .MuiInputAdornment-root': {
            '& .MuiTypography-root': {
              color: 'black',
            },
          },
        }}
        fieldProps={{
          size: 'small',
          placeholder: '',
          label: data.name,
          disabled: true,
          slotProps: {
            input: data.unit
              ? {
                  endAdornment: (
                    <InputAdornment position="end">
                      {t(data.unit)}
                    </InputAdornment>
                  ),
                }
              : {},
          },
        }}
      />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          marginLeft: 2,
        }}>
        <IconButton onClick={onEdit}>
          <EditOutlined htmlColor="#8F9BB380" />
        </IconButton>
        <IconButton onClick={onDelete}>
          <CloseOutlined htmlColor="#8F9BB380" />
        </IconButton>
      </Box>
    </Box>
  );
};

export default TechFieldEditDelete;
