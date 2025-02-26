import React, {FocusEvent, useContext, useEffect, useState} from 'react';
import AddressAutocomplete from 'mui-address-autocomplete';
import Box from '@mui/material/Box';
import LocationIcon from '@mui/icons-material/LocationOn';
import Typography from '@mui/material/Typography';
import {AddressRecord, GeocodeAddress, Language} from 'models/misc';
import {FormInput} from 'components/form/FormInput';
import {TextFieldProps} from '@mui/material/TextField';
import {useTranslation} from 'react-i18next';
import MapIcon from '@mui/icons-material/Map';
import {IconButton, InputAdornment} from '@mui/material';
import {UserCompanyContext} from 'context/UserCompanyProvider';
import {formatAddressFullname} from 'utils/utils';
import {getAddressRecordFromGoogleAddress} from 'utils/address';
import {companyLanguageContextMap} from 'utils/language';
import {MapLocationPicker} from './MapLocationPicker';

interface Props {
  getAddress?: (val?: AddressRecord) => void;
  initialValue: string;
  initialAddress?: AddressRecord;
  inputError?: string;
  handleBlur?: (e: FocusEvent<HTMLInputElement, Element>) => void;
  textFieldProps?: TextFieldProps;
  label?: string;
  noOptionsText?: string;
  allowMap?: boolean;
  shortAddress?: boolean;
}

export const AddressAutoComplete = ({
  getAddress,
  initialValue,
  inputError,
  handleBlur,
  textFieldProps,
  label,
  noOptionsText = 'Address not found. Please check and try again',
  allowMap = false,
  initialAddress,
  shortAddress,
}: Props) => {
  const [address, setAddress] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [queryView, setQueryView] = useState(initialValue);
  const {company} = useContext(UserCompanyContext);
  const [isMapOpen, setIsMapOpen] = useState(false);

  const language =
    companyLanguageContextMap[company?.language || Language.EN_US];

  const {t} = useTranslation();

  useEffect(() => {
    if (address !== null) {
      if (
        address.fullName &&
        !address.countryCode &&
        !address.component &&
        !address.location
      ) {
        setQueryView(address.fullName);
      } else if (
        shortAddress &&
        address.components?.route &&
        address.components?.street_number
      ) {
        setQueryView(
          `${address.components?.route[0]?.long_name || ''} ${
            address.components?.street_number[0]?.long_name || ''
          }`,
        );
      } else {
        setQueryView(address.formatted_address);
      }
      const data = getAddressRecordFromGoogleAddress(address);
      getAddress?.(formatAddressFullname(data) as AddressRecord);
    }
  }, [address]);

  useEffect(() => {
    if (!queryView && getAddress) {
      getAddress();
    }
    if (
      (queryView && queryView.length === 0) ||
      (queryView && queryView === address?.formatted_address)
    ) {
      setOpen(false);
    }

    if (queryView && queryView.length > 0 && getAddress && !address) {
      const addressDataObject = {
        countryCode: initialAddress?.countryCode
          ? initialAddress?.countryCode
          : null,
        fullName: queryView,
        component: {
          street: queryView,
          ...(initialAddress && {
            postalCode: initialAddress?.component?.postalCode,
            country: initialAddress?.component?.country,
            city: initialAddress?.component?.city,
            state: initialAddress?.component?.state,
            street2: initialAddress?.component?.street2,
          }),
        },
        location: initialAddress?.location ? initialAddress.location : null,
      } as AddressRecord;

      getAddress(addressDataObject);
    }
  }, [queryView, address]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQueryView(e.target.value);
    setOpen(true);
  };

  const onLocationSave = (savedAddress: GeocodeAddress) => {
    setAddress(savedAddress);
    setIsMapOpen(false);
  };

  const initialAddressForMap = (() => {
    const addressObj = address || initialAddress;
    return {
      ...addressObj,
      location:
        addressObj?.location?.latitude === 0 &&
        addressObj?.location?.longitude === 0
          ? null
          : addressObj?.location || null,
    };
  })();

  return (
    <>
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
        onChange={(_, value, reason) => {
          setAddress(value);
          if (reason === 'clear') {
            setQueryView('');
            setAddress(null);
          }
        }}
        requestOptions={{
          language,
        }}
        onClose={() => setOpen(false)}
        size="small"
        sx={{width: '100%'}}
        renderOption={(props, option) => (
          <Box component="li" {...props}>
            <LocationIcon color="action" />
            <Typography component="span" variant="body2" ml=".5em">
              {'description' in option && option.description}
            </Typography>
          </Box>
        )}
        renderInput={(params) => {
          if (allowMap) {
            params.InputProps.endAdornment = (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => {
                    setIsMapOpen(true);
                  }}
                  edge="end">
                  <MapIcon />
                </IconButton>
              </InputAdornment>
            );
          }

          return (
            <FormInput
              fieldProps={{
                sx: allowMap
                  ? {
                      '& .MuiInputBase-root': {
                        paddingRight: '15px !important',
                      },
                    }
                  : {},
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
          );
        }}
      />
      <MapLocationPicker
        isOpen={isMapOpen}
        onSave={onLocationSave}
        initialAddress={initialAddressForMap}
        onClose={() => {
          setIsMapOpen(false);
        }}
      />
    </>
  );
};
