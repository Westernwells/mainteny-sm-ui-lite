import {Box, InputLabel} from '@mui/material';
import {Button} from 'components/Button';
import {FormInput} from 'components/form/FormInput';
import {FormSelect} from 'components/form/FormSelect';
import {LanguageContext} from 'context/LanguageProvider';
import {createMeasurementOptions, MeasurementUnit} from 'models/articleForm';
import {ElevatorDataSchemaItem} from 'models/elevator';
import {useContext, useMemo, useState} from 'react';
import {useForm} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {getTechnicalFieldName} from 'utils/utils';

const FIELD_TYPE_OPTIONS = [
  {
    label: 'Text',
    value: 'text',
  },
  {
    label: 'Value',
    value: 'value',
  },
];

interface Props {
  onConfirm: (values: ElevatorDataSchemaItem) => void;
  onCancel: () => void;
  initialValues: ElevatorDataSchemaItem;
}

const DEFAULT_STOP_TRANSLATING_VALUES = {
  name: false,
  unit: false,
  type: false,
};
export const AddFieldInput = ({initialValues, onConfirm, onCancel}: Props) => {
  const {t} = useTranslation();
  const {language: selectedLng} = useContext(LanguageContext);
  const [stopTranslating, setStopTranslating] = useState(
    DEFAULT_STOP_TRANSLATING_VALUES,
  );

  const {register, getValues, setValue, watch} =
    useForm<ElevatorDataSchemaItem>({
      defaultValues: {
        type: initialValues.type || 'text',
        unit: initialValues.unit,
        name: initialValues.name,
      },
    });

  const handleConfirm = () => {
    const values = getValues();
    onConfirm(values);
  };

  const handleChange = (label: keyof ElevatorDataSchemaItem, value: string) => {
    if (label === 'type') {
      setValue('unit', '');
    }

    setValue(label, value);
  };

  const selectedUnit = watch('unit') || '';
  const selectedType = watch('type') || '';
  const enteredName = watch('name') || '';

  const shouldConfirmDisabled = () => {
    if (selectedType === 'value') {
      return !selectedUnit || !enteredName;
    }

    return !enteredName;
  };

  const measuringUnits = useMemo(
    () =>
      createMeasurementOptions(selectedLng, MeasurementUnit.UE).map((item) => ({
        ...item,
        label: t(item.label),
      })),
    [t, selectedLng],
  );

  const fieldTypeOptions = useMemo(
    () => FIELD_TYPE_OPTIONS.map((item) => ({...item, label: t(item.label)})),
    [t, selectedLng, FIELD_TYPE_OPTIONS],
  );

  return (
    <Box
      sx={{
        border: '1px solid #828DA3',
        padding: 3,
        paddingBottom: 3,
        borderRadius: 1,
        background: '#F7F9FC',
      }}>
      <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'flex-end'}}>
        <Box>
          <InputLabel
            sx={{color: '#828DA3', fontWeight: 'bold', fontSize: '0.8em'}}>
            {t('Field type')}
          </InputLabel>
          <FormSelect
            labelId=""
            label=""
            containerStyles={{
              width: 150,
              '& .MuiInputBase-root': {
                backgroundColor: 'white',
                height: 40,
              },
            }}
            options={fieldTypeOptions}
            selectProps={{
              id: 'address.component.country',
              notched: true,
              ...register('type'),
              value: selectedType,
              onChange: (event) => {
                handleChange('type', event.target.value as string);
              },
            }}
            isCompanyTranslation
          />
        </Box>
        <Box ml={2} flex={1}>
          <InputLabel
            sx={{color: '#828DA3', fontWeight: 'bold', fontSize: '0.8em'}}>
            {t('Field name')}
          </InputLabel>
          <FormInput
            containerStyles={{
              '& .MuiInputBase-root': {
                backgroundColor: 'white',
                height: 40,
              },
            }}
            fieldProps={{
              size: 'small',

              placeholder: '',
              required: true,
              ...register('name'),
              value: stopTranslating.name
                ? enteredName
                : getTechnicalFieldName({name: enteredName}, t),
              onChange: (event) => {
                handleChange('name', event.target.value as string);
                setStopTranslating({...stopTranslating, name: true});
              },
            }}
          />
        </Box>
        {selectedType === 'value' && (
          <Box ml={2}>
            <InputLabel
              sx={{color: '#828DA3', fontWeight: 'bold', fontSize: '0.8em'}}>
              {t('Unit')}
            </InputLabel>
            <FormSelect
              labelId=""
              label=""
              containerStyles={{
                width: 80,
                '& .MuiInputBase-root': {
                  backgroundColor: 'white',
                  height: 40,
                },
              }}
              options={measuringUnits}
              selectProps={{
                id: 'address.component.country',
                notched: true,
                ...register('unit'),
                value: selectedUnit,
                onChange: (event) => {
                  handleChange('unit', event.target.value as string);
                },
              }}
              isCompanyTranslation
            />
          </Box>
        )}
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          marginTop: 3,
          justifyContent: 'space-between',
        }}>
        <Button buttonProps={{onClick: onCancel}} label="Cancel" />
        <Button
          buttonProps={{onClick: handleConfirm}}
          style={{background: 'transparent'}}
          disabled={shouldConfirmDisabled()}
          variant="outlined"
          label="Confirm"
        />
      </Box>
    </Box>
  );
};
