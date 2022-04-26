import React, {ChangeEvent, useState} from 'react';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import {SelectChangeEvent} from '@mui/material';
import AddressAutocomplete from 'mui-address-autocomplete';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationIcon from '@mui/icons-material/LocationOn';
import EyeIcon from '@mui/icons-material/RemoveRedEye';
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
import {EmployeeAccountData, Shift} from './model';

interface Props {
  formikValues: EmployeeAccountData;
  formikHandleChange: (e: ChangeEvent<any>) => void;
  handleRoleChange: (event: SelectChangeEvent<string[]>) => void;
  setAddress: (address: any) => void;
  orderTypes: {[key: string]: {label: string; checked: boolean}};
  handleCheckbox: (event: ChangeEvent<HTMLInputElement>) => void;
  shifts: Shift<Date | null>[];
  setShifts: React.Dispatch<React.SetStateAction<Shift<Date | null>[]>>;
}

export const AddEmployeeForm = ({
  formikValues,
  formikHandleChange,
  handleRoleChange,
  setAddress,
  orderTypes,
  handleCheckbox,
  shifts,
  setShifts,
}: Props) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

  return (
    <form onSubmit={() => {}}>
      <Box>
        <Box display="flex" gap="1em">
          <FormInput
            id="firstName"
            label="First Name"
            placeholder="Blake"
            value={formikValues.firstName}
            onChange={formikHandleChange}
          />
          <FormInput
            id="lastName"
            label="Last Name"
            placeholder="Norton"
            value={formikValues.lastName}
            onChange={formikHandleChange}
          />
        </Box>

        <FormInput
          id="username"
          label="Email"
          placeholder="blake@mainteny.com"
          params={{type: 'email'}}
          value={formikValues.username}
          onChange={formikHandleChange}
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
          value={formikValues.phone}
          onChange={formikHandleChange}
          inputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <PhoneIcon />
              </InputAdornment>
            ),
          }}
        />

        <FormInput
          id="password"
          label="Password"
          placeholder=" "
          value={formikValues.password}
          onChange={formikHandleChange}
          params={{type: !isPasswordVisible && 'password'}}
          inputProps={{
            endAdornment: (
              <InputAdornment
                position="end"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                sx={{cursor: 'pointer'}}>
                <EyeIcon />
              </InputAdornment>
            ),
          }}
        />

        <FormSelect
          labelId="rolesSelect-label"
          id="rolesSelect"
          label="Roles"
          value={formikValues.roles}
          options={Object.keys(Role)
            .filter((role) => role !== 'ADMIN')
            .map((role) => convertToText(role))}
          onChange={handleRoleChange}
        />

        {formikValues.roles.includes(convertToText(Role.TECHNICIAN)) && (
          <>
            <AddressAutocomplete
              value={formikValues.address}
              apiKey={process.env.REACT_APP_GOOGLE_MAPS_KEY!}
              label="Address"
              fields={[
                'address_components',
                'formatted_address',
                'geometry',
                'place_id',
              ]}
              // TODO: Resolve 'any' here
              onChange={(_, value: any) => {
                setAddress(value);
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
                  params={params}
                />
              )}
            />

            <Typography variant="h6" my=".75em">
              Order Types
            </Typography>

            <FormCheckbox
              options={[
                {
                  checked: orderTypes.REGULAR.checked,
                  name: orderTypes.REGULAR.label,
                  label: (
                    <Box display="flex" alignItems="center">
                      <RegularIcon style={{height: '1.25em'}} />
                      <Typography variant="body2" ml=".25em">
                        Maintenance
                      </Typography>
                    </Box>
                  ),
                },
                {
                  checked: orderTypes.REPAIR.checked,
                  name: orderTypes.REPAIR.label,
                  label: (
                    <Box display="flex" alignItems="center">
                      <RepairIcon sx={{color: 'amber.main', height: '.75em'}} />
                      <Typography variant="body2">Repair</Typography>
                    </Box>
                  ),
                },
                {
                  checked: orderTypes.EMERGENCY.checked,
                  name: orderTypes.EMERGENCY.label,
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
                  checked: orderTypes.CALLOUT.checked,
                  name: orderTypes.CALLOUT.label,
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

            <ShiftTime shifts={shifts} setShifts={setShifts} />
          </>
        )}
      </Box>
    </form>
  );
};
