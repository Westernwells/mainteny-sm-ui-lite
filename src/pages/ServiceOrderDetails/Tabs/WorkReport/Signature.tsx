import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {FormInput} from 'components/form/FormInput';
import {FormikProps} from 'formik';
import {debounce} from 'lodash';
import {CompleteServiceOrder} from 'models/service-order';
import {ChangeEvent, useState} from 'react';
import {useTranslation} from 'react-i18next';

interface Props {
  url?: string;
  name: string;
  designation: string;
  formik?: FormikProps<CompleteServiceOrder & {serviceTimeHM: string}>;
  disabled?: boolean;
}

export const Signature = ({
  formik,
  url,
  name,
  designation,
  disabled = false,
}: Props) => {
  const [customerName, setCustomerName] = useState(formik?.values.customerName);
  const {t} = useTranslation();

  const updateCustomerNameChange = debounce((text: string) => {
    formik?.setFieldValue('customerName', text);
  }, 700);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCustomerName(e.target.value);

    // Changes are not immediately propagated because there is a performance issue
    updateCustomerNameChange(e.target.value);
  };

  return (
    <Box>
      <Box
        mt=".5em"
        display="grid"
        justifyItems="center"
        textAlign="center"
        textTransform="capitalize">
        <Box
          height="8em"
          width="20em"
          border="2px solid"
          borderColor="primary.outlinedHoverBg"
          padding=".75em"
          borderRadius=".75em"
          display="flex"
          alignItems="center"
          overflow="hidden"
          justifyContent="center">
          {url ? (
            <img
              alt=""
              src={url}
              style={{
                objectFit: 'contain',
                objectPosition: 'top',
                maxWidth: '100%',
                maxHeight: '300%',
                height: '100%',
              }}
            />
          ) : (
            t('No Signature')
          )}
        </Box>
        <Box mt="-.8em" px=".25em" bgcolor="white">
          <Typography variant="h6">{name}</Typography>
        </Box>
        <Typography variant="body2" color="textSecondary">
          {t(designation)}
        </Typography>
      </Box>
      {designation === 'Customer' && (
        <FormInput
          fieldProps={{
            disabled,
            sx: {mt: 2},
            size: 'small',
            label: 'Customer name',
            name: 'customerName',
            value: customerName,
            type: 'text',
            onChange: handleChange,
          }}
        />
      )}
    </Box>
  );
};
