import {FocusEvent, useEffect, useState} from 'react';
import AddressAutocomplete from 'mui-address-autocomplete';
import Box from '@mui/material/Box';
import LocationIcon from '@mui/icons-material/LocationOn';
import Typography from '@mui/material/Typography';
import {AddressRecord} from 'models/misc';
import {FormInput} from 'components/form/FormInput';
import {TextFieldProps} from '@mui/material/TextField';
import {useTranslation} from 'react-i18next';

interface Props {
  getAddress?: (val?: AddressRecord) => void;
  initialValue: string;
  inputError?: string;
  handleBlur?: (e: FocusEvent<any, Element>) => void;
  textFieldProps?: TextFieldProps;
  label?: string;
  noOptionsText?: string;
}

export const AddressAutoComplete = ({
  getAddress,
  initialValue,
  inputError,
  handleBlur,
  textFieldProps,
  label,
  noOptionsText = 'No options',
}: Props) => {
  const [address, setAddress] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [queryView, setQueryView] = useState(initialValue);

  const {t} = useTranslation();

  useEffect(() => {
    if (address !== null) {
      setQueryView(address.formatted_address);
      if (getAddress) {
        getAddress({
          countryCode: address.components.country[0]!.short_name,
          fullName: address!.formatted_address,
          location: {
            latitude: address.geometry.location!.lat(),
            longitude: address.geometry.location!.lng(),
          },
        });
      }
    }
  }, [address]);

  useEffect(() => {
    if (!queryView && getAddress) {
      getAddress();
    }

    if (queryView.length === 0) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, [queryView]);

  const onInputChange = (e: any) => {
    setQueryView(e.target.value);

    // if (queryView.length === 0) {
    //   if (open) {
    //     setOpen(false);
    //   } else if (!open) setOpen(true);
    // }
  };
  return (
    <AddressAutocomplete
      noOptionsText={
        typeof noOptionsText === 'string' ? t(noOptionsText) : noOptionsText
      }
      open={open}
      inputValue={queryView}
      value={address}
      apiKey={import.meta.env.REACT_APP_GOOGLE_MAPS_KEY!}
      label={label || t('Address')}
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
      sx={{width: '100%'}}
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
            label: label || t('Address'),
            placeholder: 'Enter a location',
            name: 'address',
            onChange: onInputChange,
            error: !!inputError,
            helperText: inputError && t(inputError),
            onBlur: handleBlur,
            ...params,
            ...textFieldProps,
            InputLabelProps: {
              shrink: true,
            },
          }}
        />
      )}
    />
  );
};
