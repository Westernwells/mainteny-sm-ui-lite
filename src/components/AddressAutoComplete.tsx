import {FocusEvent, useContext, useEffect, useState} from 'react';
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
import {useFetchAddressObjectByName} from 'hooks/reactQuery/useAddress';
import {UserCompanyContext} from 'context/UserCompanyProvider';
import {companyLanguageContextMap} from 'utils/utils';
import {MapLocationPicker} from './MapLocationPicker';

interface Props {
  getAddress?: (val?: AddressRecord) => void;
  initialValue: string;
  initialAddress?: AddressRecord;
  inputError?: string;
  handleBlur?: (e: FocusEvent<any, Element>) => void;
  textFieldProps?: TextFieldProps;
  label?: string;
  noOptionsText?: string;
  allowMap?: boolean;
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
}: Props) => {
  const [address, setAddress] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [queryView, setQueryView] = useState(initialValue);
  const {company} = useContext(UserCompanyContext);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const {data: addressData} = useFetchAddressObjectByName(
    address?.formatted_address,
  );

  const language =
    companyLanguageContextMap[company?.language || Language.EN_US];

  const {t} = useTranslation();

  useEffect(() => {
    if (getAddress && addressData) {
      getAddress({
        countryCode: addressData?.countryCode,
        fullName: addressData?.fullName as string,
        component: {
          postalCode: addressData?.component?.postalCode,
          country: addressData?.component?.country,
          city: addressData?.component?.city,
          state: addressData?.component?.state,
        },
        location: {
          latitude: addressData?.location?.latitude as number,
          longitude: addressData?.location?.longitude as number,
        },
      });
    }
  }, [addressData]);

  useEffect(() => {
    if (address !== null) {
      setQueryView(address.formatted_address);
    }
  }, [address]);

  useEffect(() => {
    if (!queryView && getAddress) {
      getAddress();
    }

    if (queryView.length === 0 || queryView === address?.formatted_address) {
      setOpen(false);
    }
  }, [queryView]);

  const onInputChange = (e: any) => {
    setQueryView(e.target.value);
    setOpen(true);
  };

  const onLocationSave = (savedAddress: GeocodeAddress) => {
    setAddress(savedAddress);
    setIsMapOpen(false);
  };

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
        onChange={(_, value: any, reason: string) => {
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
        renderOption={(props, option: any) => (
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
              props={{
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
        initialAddress={address || initialAddress}
        onClose={() => {
          setIsMapOpen(false);
        }}
      />
    </>
  );
};
