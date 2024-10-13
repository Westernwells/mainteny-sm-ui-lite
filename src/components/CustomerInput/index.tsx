import {PropertyOwnerView} from 'models/propertyManager';
import {SyntheticEvent, useMemo} from 'react';
import Autocomplete from 'components/Autocomplete';
import {Option} from 'models/filter';
import {Box, Typography} from '@mui/material';
import {useTranslation} from 'react-i18next';
import capitalize from 'lodash/capitalize';

type Props = {
  selectedValue?: string;
  customers: PropertyOwnerView[];
  onChange: (value: string | undefined) => void;
};

const CustomerInput = ({selectedValue, customers, onChange}: Props) => {
  const {t} = useTranslation();

  const customerOptions: Option[] = useMemo(
    () =>
      customers.map((customer) => ({
        label: customer.name,
        value: customer.id,
      })),
    [customers],
  );

  const selectedCustomer = useMemo(
    () => customerOptions.find((customer) => customer.value === selectedValue),
    [customerOptions, selectedValue],
  );

  const handleChange = (_: SyntheticEvent, option: Option | null) => {
    onChange(option?.value ? option.value : undefined);
  };

  const handleMatchingSelectedValueToOptions = (
    option: Option,
    value: Option,
  ) => option.value === value.value;

  return (
    <Box sx={{display: 'flex', flexDirection: 'column'}} gap={1}>
      <Typography variant="subtitle2">{capitalize(t('CUSTOMER'))}</Typography>
      <Autocomplete
        value={selectedCustomer}
        options={customerOptions}
        placeholderKey="Select customer"
        isOptionEqualToValue={handleMatchingSelectedValueToOptions}
        onChange={handleChange}
      />
    </Box>
  );
};

export default CustomerInput;
