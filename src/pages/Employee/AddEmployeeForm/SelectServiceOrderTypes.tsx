import {ChangeEvent, useEffect, useState} from 'react';
import {useFormikContext} from 'formik';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import RepairIcon from '@mui/icons-material/SettingsOutlined';
import {ReactComponent as EmergencyIcon} from 'assets/icons/Emergency.svg';
import {ReactComponent as RegularIcon} from 'assets/icons/Regular.svg';
import {ReactComponent as CalloutIcon} from 'assets/icons/Callout.svg';

import {ServiceOrderType} from 'models/service-order';
import {EmployeeAccountData} from './model';
import {FormCheckbox} from './FormCheckbox';

export const SelectServiceOrderTypes = () => {
  const [serviceOrderTypes, setServiceOrderTypes] = useState({
    REGULAR: {label: ServiceOrderType.REGULAR, checked: true},
    REPAIR: {label: ServiceOrderType.REPAIR, checked: true},
    EMERGENCY: {label: ServiceOrderType.EMERGENCY, checked: true},
    CALLOUT: {label: ServiceOrderType.CALLOUT, checked: true},
  });

  const {setFieldValue} = useFormikContext<EmployeeAccountData>();

  const handleCheckbox = (event: ChangeEvent<HTMLInputElement>) => {
    setServiceOrderTypes({
      ...serviceOrderTypes,
      [event.target.name]: {
        checked: event.target.checked,
        label:
          ServiceOrderType[
            event.target.name as unknown as typeof ServiceOrderType.EMERGENCY
          ],
      },
    });
  };

  useEffect(() => {
    setFieldValue(
      'serviceOrderTypes',
      Object.values(serviceOrderTypes)
        .filter((item) => item.checked)
        .map((i) => i.label),
    );
  }, [serviceOrderTypes]);

  return (
    <FormCheckbox
      options={[
        {
          checked: serviceOrderTypes.REGULAR.checked,
          name: serviceOrderTypes.REGULAR.label,
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
          checked: serviceOrderTypes.REPAIR.checked,
          name: serviceOrderTypes.REPAIR.label,
          label: (
            <Box display="flex" alignItems="center">
              <RepairIcon sx={{color: 'amber.main', height: '.75em'}} />
              <Typography variant="body2">Repair</Typography>
            </Box>
          ),
        },
        {
          checked: serviceOrderTypes.EMERGENCY.checked,
          name: serviceOrderTypes.EMERGENCY.label,
          label: (
            <Box display="flex" alignItems="center">
              <EmergencyIcon style={{height: '.8em', marginLeft: '-.2em'}} />
              <Typography variant="body2">Emergency</Typography>
            </Box>
          ),
        },
        {
          checked: serviceOrderTypes.CALLOUT.checked,
          name: serviceOrderTypes.CALLOUT.label,
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
  );
};
