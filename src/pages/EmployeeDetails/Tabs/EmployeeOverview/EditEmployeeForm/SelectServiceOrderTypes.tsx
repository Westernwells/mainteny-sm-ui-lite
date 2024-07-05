import {ChangeEvent, useEffect, useRef, useState} from 'react';
import useTheme from '@mui/material/styles/useTheme';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {Settings} from '@mui/icons-material';
import YoutubeSearchedForIcon from '@mui/icons-material/YoutubeSearchedFor';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import UploadIcon from '@mui/icons-material/Upload';
import HandymanIcon from '@mui/icons-material/Handyman';
import {ReactComponent as EmergencyIcon} from 'assets/icons/Emergency.svg';
import {ReactComponent as RegularIcon} from 'assets/icons/Regular.svg';
import {ReactComponent as CalloutIcon} from 'assets/icons/Callout.svg';
import {FormCheckbox} from 'components/form/FormCheckbox';
import {ServiceOrderType} from 'models/service-order';
import {useTranslation} from 'react-i18next';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';

type Props = {
  values: any;
  setFieldValue: any;
};

export const SelectServiceOrderTypes = ({values, setFieldValue}: Props) => {
  const theme = useTheme();
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
    INSPECTION: {
      label: ServiceOrderType.INSPECTION,
      checked: values.serviceOrderTypes.includes(ServiceOrderType.INSPECTION),
    },
    NEW_INSTALLATION: {
      label: ServiceOrderType.NEW_INSTALLATION,
      checked: values.serviceOrderTypes.includes(
        ServiceOrderType.NEW_INSTALLATION,
      ),
    },
    MODERNIZATION: {
      label: ServiceOrderType.MODERNIZATION,
      checked: values.serviceOrderTypes.includes(
        ServiceOrderType.MODERNIZATION,
      ),
    },
    GENERAL: {
      label: ServiceOrderType.GENERAL,
      checked: values.serviceOrderTypes.includes(ServiceOrderType.GENERAL),
    },
    OPERATION: {
      label: ServiceOrderType.OPERATION,
      checked: values.serviceOrderTypes.includes(ServiceOrderType.OPERATION),
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
          <Settings
            sx={{
              color: 'amber.main',
              height: '.75em',
              width: '.75em',
              marginRight: '0.25em',
            }}
          />
          <Typography variant="body2">{t('Repair')}</Typography>
        </Box>
      ),
    },
    {
      checked: serviceOrderTypes.EMERGENCY.checked,
      name: serviceOrderTypes.EMERGENCY.label,
      label: (
        <Box display="flex" alignItems="center">
          <EmergencyIcon
            style={{
              height: '.8em',
              width: '100%',
              marginLeft: '-.2em',
              marginRight: '0.25em',
            }}
          />
          <Typography variant="body2">{t('Emergency')}</Typography>
        </Box>
      ),
    },
    {
      checked: serviceOrderTypes.CALLOUT.checked,
      name: serviceOrderTypes.CALLOUT.label,
      label: (
        <Box display="flex" alignItems="center">
          <CalloutIcon style={{height: '1em', marginRight: '0.25em'}} />
          <Typography variant="body2">{t('Callout')}</Typography>
        </Box>
      ),
    },
    {
      checked: serviceOrderTypes.INSPECTION.checked,
      name: serviceOrderTypes.INSPECTION.label,
      label: (
        <Box display="flex" alignItems="center">
          <YoutubeSearchedForIcon
            style={{
              color: theme.palette.primary.main,
              height: '1em',
              marginRight: '0.25em',
            }}
          />
          <Typography variant="body2">{t('Inspection')}</Typography>
        </Box>
      ),
    },
    {
      checked: serviceOrderTypes.NEW_INSTALLATION.checked,
      name: serviceOrderTypes.NEW_INSTALLATION.label,
      label: (
        <Box display="flex" alignItems="center">
          <BuildCircleIcon
            style={{
              color: theme.palette.secondary.dark,
              height: '1em',
              marginRight: '0.25em',
            }}
          />
          <Typography variant="body2">{t('Installation')}</Typography>
        </Box>
      ),
    },
    {
      checked: serviceOrderTypes.MODERNIZATION.checked,
      name: serviceOrderTypes.MODERNIZATION.label,
      label: (
        <Box display="flex" alignItems="center">
          <UploadIcon
            style={{
              color: theme.palette.primary.main,
              height: '1em',
              marginRight: '0.25em',
            }}
          />
          <Typography variant="body2">{t('Modernization')}</Typography>
        </Box>
      ),
    },
    {
      checked: serviceOrderTypes.GENERAL.checked,
      name: serviceOrderTypes.GENERAL.label,
      label: (
        <Box display="flex" alignItems="center">
          <HandymanIcon
            style={{
              color: theme.palette.primary.main,
              height: '1em',
              marginRight: '0.25em',
            }}
          />
          <Typography variant="body2">{t('General')}</Typography>
        </Box>
      ),
    },
    {
      checked: serviceOrderTypes.OPERATION.checked,
      name: serviceOrderTypes.OPERATION.label,
      label: (
        <Box display="flex" alignItems="center">
          <RemoveRedEyeIcon
            style={{
              color: theme.palette.primary.main,
              height: '1em',
              marginRight: '0.25em',
            }}
          />
          <Typography variant="body2">{t('Elevator Operation')}</Typography>
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
