import {useEffect, useState} from 'react';
import {useFormikContext} from 'formik';
import AddressAutocomplete from 'mui-address-autocomplete';
import Box from '@mui/material/Box';
import LocationIcon from '@mui/icons-material/LocationOn';
import Typography from '@mui/material/Typography';
import {FormInput} from 'components/form/FormInput';
import {EmployeeAccountData} from './model';

export const SelectAddress = () => {
  const [address, setAddress] = useState<any>(null);

  const {setFieldValue} = useFormikContext<EmployeeAccountData>();

  useEffect(() => {
    setFieldValue(
      'address',
      address !== null && {
        countryCode: address.components.country[0]!.short_name,
        fullName: address!.formatted_address,
        location: {
          latitude: address.geometry.location!.lat(),
          longitude: address.geometry.location!.lng(),
        },
      },
    );
  }, [address]);

  return (
    <AddressAutocomplete
      value={address}
      apiKey={process.env.REACT_APP_GOOGLE_MAPS_KEY!}
      label="Address"
      fields={[
        'address_components',
        'formatted_address',
        'geometry',
        'place_id',
      ]}
      onChange={(_, value: any) => {
        setAddress(value);
      }}
      size="small"
      renderOption={(props, option: any) => (
        <Box component="li" {...props}>
          <LocationIcon color="action" />
          <Typography component="span" variant="body2" ml=".5em">
            {'description' in option && option.description}
          </Typography>
        </Box>
      )}
      renderInput={(params) => (
        <FormInput
          props={{
            label: 'Address',
            placeholder: 'Enter a location',
            ...params,
          }}
        />
      )}
    />
  );
};
