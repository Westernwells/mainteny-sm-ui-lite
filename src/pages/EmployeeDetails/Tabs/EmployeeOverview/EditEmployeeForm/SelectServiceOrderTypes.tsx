import {ChangeEvent, useEffect, useRef, useState} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import RepairIcon from '@mui/icons-material/SettingsOutlined';
import {ReactComponent as EmergencyIcon} from 'assets/icons/Emergency.svg';
import {ReactComponent as RegularIcon} from 'assets/icons/Regular.svg';
import {ReactComponent as CalloutIcon} from 'assets/icons/Callout.svg';
import {FormCheckbox} from 'components/form/FormCheckbox';
import {ServiceOrderType} from 'models/service-order';
import {useTranslation} from 'react-i18next';

type Props = {
  values: any;
  setFieldValue: any;
};

export const SelectServiceOrderTypes = ({values, setFieldValue}: Props) => {
  const {t} = useTranslation();
  const [serviceOrderTypes, setServiceOrderTypes] = useState({
    REGULAR: {
      label: ServiceOrderType.REGULAR,
      checked: values.serviceOrderTypes.includes(ServiceOrderType.REGULAR),
    },
    REPAIR: {
      label: ServiceOrderType.REPAIR,
      checked: values.serviceOrderTypes.includes(ServiceOrderType.REPAIR),
    },
    EMERGENCY: {
      label: ServiceOrderType.EMERGENCY,
      checked: values.serviceOrderTypes.includes(ServiceOrderType.EMERGENCY),
    },
    CALLOUT: {
      label: ServiceOrderType.CALLOUT,
      checked: values.serviceOrderTypes.includes(ServiceOrderType.CALLOUT),
    },
  });

  const optionsRef = useRef([
    {
      checked: serviceOrderTypes.REGULAR.checked,
      name: serviceOrderTypes.REGULAR.label,
      label: (
        <Box display="flex" alignItems="center">
          <RegularIcon style={{height: '1.25em'}} />
          <Typography variant="body2" ml=".25em">
            {t('Maintenance')}
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
          <Typography variant="body2">{t('Repair')}</Typography>
        </Box>
      ),
    },
    {
      checked: serviceOrderTypes.EMERGENCY.checked,
      name: serviceOrderTypes.EMERGENCY.label,
      label: (
        <Box display="flex" alignItems="center">
          <EmergencyIcon style={{height: '.8em', marginLeft: '-.2em'}} />
          <Typography variant="body2">{t('Emergency')}</Typography>
        </Box>
      ),
    },
    {
      checked: serviceOrderTypes.CALLOUT.checked,
      name: serviceOrderTypes.CALLOUT.label,
      label: (
        <Box display="flex" alignItems="center">
          <CalloutIcon style={{height: '1em'}} />
          <Typography variant="body2">{t('Callout')}</Typography>
        </Box>
      ),
    },
  ]).current;

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
    <>
      {optionsRef.map((option) => (
        <FormCheckbox
          checked={serviceOrderTypes[option.name].checked}
          name={option.name}
          key={option.name}
          label={option.label}
          handleChange={handleCheckbox}
        />
      ))}
    </>
  );
};
