import {InputAdornment} from '@mui/material';
import Grid from '@mui/material/Grid';
import {FormInput} from 'components/form/FormInput';
import {ElevatorDataItemView} from 'models/elevator';
import {UseFormRegister} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {escapeDotInString} from 'utils/utils';

interface Props {
  register: UseFormRegister<{
    [key: string]: string;
  }>;
  elevatorDataItems: ElevatorDataItemView[];
}

const EditTechnicalDataForm = ({elevatorDataItems, register}: Props) => {
  const {t} = useTranslation();

  return (
    <Grid container spacing={2} component="form">
      {elevatorDataItems.map((item) => (
        <Grid item md={4} sm={6} xs={12}>
          <FormInput
            fieldProps={{
              slotProps: {
                input: {
                  endAdornment: item.unit ? (
                    <InputAdornment position="end">
                      {t(item.unit)}
                    </InputAdornment>
                  ) : null,
                },
              },
              placeholder: '',
              type: 'text',
              label: item.name,
              // Escaping dot is important otherwise react-hook-form won't work
              ...register(escapeDotInString(item.name)),
            }}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default EditTechnicalDataForm;
