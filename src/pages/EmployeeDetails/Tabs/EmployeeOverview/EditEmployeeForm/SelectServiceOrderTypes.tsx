import {ChangeEvent, useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {FormCheckbox} from 'components/form/FormCheckbox';
import {ServiceOrderTypeRecord} from 'models/service-order';
import {serviceOrderTypeToString} from 'utils/service-order-utils';
import {iconMapping} from 'pages/ServiceOrders';
import {t} from 'i18next';

type Props = {
  values: any;
  setFieldValue: any;
  jobTypes?: ServiceOrderTypeRecord[];
};

export const SelectServiceOrderTypes = ({
  values,
  setFieldValue,
  jobTypes = [],
}: Props) => {
  const initialServiceOrderTypes = jobTypes?.reduce((acc, type) => {
    acc[type.name] = {
      label: type.name,
      checked: values.serviceOrderTypes.includes(type.name),
    };
    return acc;
  }, {} as Record<string, {label: string; checked: boolean}>);

  const [serviceOrderTypes, setServiceOrderTypes] = useState(
    initialServiceOrderTypes,
  );

  const optionsRef = jobTypes.map((jobType) => {
    const IconComponent = iconMapping[jobType.icon as keyof typeof iconMapping];

    return {
      checked: serviceOrderTypes[jobType.name]?.checked,
      name: jobType.name,
      label: (
        <Box display="flex" alignItems="center">
          <IconComponent />
          <Typography variant="body2" ml=".25em">
            {serviceOrderTypeToString(jobType.name) === '-'
              ? jobType.name
              : t(serviceOrderTypeToString(jobType.name))}
          </Typography>
        </Box>
      ),
    };
  });

  const handleCheckbox = (event: ChangeEvent<HTMLInputElement>) => {
    setServiceOrderTypes({
      ...serviceOrderTypes,
      [event.target.name]: {
        checked: event.target.checked,
        label: event.target.name,
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
          style={{width: '47%'}}
        />
      ))}
    </>
  );
};
