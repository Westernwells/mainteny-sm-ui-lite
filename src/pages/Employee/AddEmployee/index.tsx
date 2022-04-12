import {ChangeEvent, useState} from 'react';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import {SelectChangeEvent} from '@mui/material';
import AddressAutocomplete from 'mui-address-autocomplete';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationIcon from '@mui/icons-material/LocationOn';
import {Role} from 'models/user';

import RepairIcon from '@mui/icons-material/SettingsOutlined';
import {ReactComponent as EmergencyIcon} from 'assets/icons/Emergency.svg';
import {ReactComponent as RegularIcon} from 'assets/icons/Regular.svg';
import {ReactComponent as CalloutIcon} from 'assets/icons/Callout.svg';

import {convertToText} from 'utils/utils';

import {FormInput} from './FormInput';
import {FormSelect} from './FormSelect';
import {FormCheckbox} from './FormCheckbox';
import {ShiftTime} from './ShiftTime';

export const AddEmployee = () => {
  const [address, setAddress] = useState(null);

  const [roles, setRoles] = useState<string[]>([]);

  const [orderTypes, setOrderTypes] = useState({
    maintenance: true,
    repair: true,
    emergency: true,
    callout: true,
  });

  const handleRoleChange = (event: SelectChangeEvent<typeof roles>) => {
    const {
      target: {value},
    } = event;
    setRoles(typeof value === 'string' ? value.split(',') : value);
  };

  const handleCheckbox = (event: ChangeEvent<HTMLInputElement>) => {
    setOrderTypes({
      ...orderTypes,
      [event.target.name]: event.target.checked,
    });
  };

  return (
    <form onSubmit={() => {}}>
      <Box>
        <Box display="flex" gap="1em">
          <FormInput id="firstName" label="First Name" placeholder="Blake" />
          <FormInput id="lastName" label="Last Name" placeholder="Norton" />
        </Box>

        <FormInput
          id="email"
          label="Email"
          placeholder="blake@mainteny.com"
          inputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <EmailIcon />
              </InputAdornment>
            ),
          }}
        />

        <FormInput
          id="phone"
          label="Phone"
          placeholder="+49 234567 12345"
          inputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <PhoneIcon />
              </InputAdornment>
            ),
          }}
        />

        <AddressAutocomplete
          value={address}
          apiKey={process.env.REACT_APP_GOOGLE_MAPS_KEY!}
          label="Address"
          fields={['address_components']}
          // TODO: Resolve 'any' here
          onChange={(_: any, value: any) => {
            setAddress(value);
            console.log('ADDRESS', value);
          }}
          size="small"
          // TODO: Resolve 'any' here
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
              id="address"
              label="Address"
              placeholder="Enter a location"
              inputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <EmailIcon />
                  </InputAdornment>
                ),
              }}
              params={params}
            />
          )}
        />

        <FormSelect
          labelId="rolesSelect-label"
          id="rolesSelect"
          label="Roles"
          value={roles}
          options={Object.keys(Role)
            .filter((role) => role !== 'ADMIN')
            .map((role) => convertToText(role))}
          onChange={handleRoleChange}
        />

        {roles.includes(convertToText(Role.TECHNICIAN)) && (
          <>
            <Typography variant="h6" my=".75em">
              Order Types
            </Typography>

            <FormCheckbox
              options={[
                {
                  checked: orderTypes.maintenance,
                  name: 'maintenance',
                  label: (
                    <Box display="flex" alignItems="center">
                      <RegularIcon style={{height: '1.25em'}} />
                      <Typography variant="body2" ml=".25em">
                        Maintenance
                      </Typography>{' '}
                    </Box>
                  ),
                },
                {
                  checked: orderTypes.repair,
                  name: 'repair',
                  label: (
                    <Box display="flex" alignItems="center">
                      <RepairIcon sx={{color: '#ED6C02', height: '.75em'}} />
                      <Typography variant="body2">Repair</Typography>
                    </Box>
                  ),
                },
                {
                  checked: orderTypes.emergency,
                  name: 'emergency',
                  label: (
                    <Box display="flex" alignItems="center">
                      <EmergencyIcon
                        style={{height: '.8em', marginLeft: '-.2em'}}
                      />
                      <Typography variant="body2">Emergency</Typography>
                    </Box>
                  ),
                },
                {
                  checked: orderTypes.callout,
                  name: 'callout',
                  label: (
                    <Box display="flex" alignItems="center">
                      <CalloutIcon style={{height: '1em'}} />
                      <Typography variant="body2">Callout</Typography>
                    </Box>
                  ),
                },
              ]}
              onChange={handleCheckbox}
            />

            <Typography variant="h6" my=".75em">
              Shift Time
            </Typography>

            <ShiftTime />
          </>
        )}
      </Box>
    </form>
  );
};
