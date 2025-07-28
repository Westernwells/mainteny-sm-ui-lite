import React from 'react';
import {
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Tooltip,
} from '@mui/material';
import {useTranslation} from 'react-i18next';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  ContractServiceDeliveryType,
  SERVICE_DELIVERY_TYPES,
} from 'models/contract';

interface Props {
  onChange: (e: SelectChangeEvent<ContractServiceDeliveryType>) => void;
  onBlur?: (
    e: React.FocusEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
  value?: ContractServiceDeliveryType;
}

const ServiceDeliveryPeriodInput = ({onChange, onBlur, value}: Props) => {
  const {t} = useTranslation();

  return (
    <FormControl fullWidth required>
      <InputLabel size="small" shrink variant="outlined">
        {t('Service delivery period')}
        <Tooltip
          title={t(
            'Configure the service delivery period for the automatically generated invoices from this service',
          )}
          placement="top">
          <IconButton sx={{marginLeft: '3px', padding: 0}}>
            <InfoOutlinedIcon sx={{fontSize: '16px', mb: 0}} />
          </IconButton>
        </Tooltip>
      </InputLabel>
      <Select
        label={`${t('Service delivery period')}*`}
        size="small"
        value={value}
        sx={{
          '& .MuiOutlinedInput-notchedOutline': {
            '& legend': {
              paddingRight: '13px',
            },
          },
        }}
        required
        notched
        name="serviceDeliveryType"
        onBlur={onBlur}
        onChange={onChange}>
        {SERVICE_DELIVERY_TYPES.map((deliveryType) => (
          <MenuItem value={deliveryType.value} key={deliveryType.value}>
            {t(deliveryType.label)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default ServiceDeliveryPeriodInput;
