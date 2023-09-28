import React from 'react';
import {Typography, Box, Button} from '@mui/material';
import {AutoAwesome} from '@mui/icons-material';
import {PropertyOwnerView} from 'models/propertyManager';
import {ServiceCompanyNumberType} from 'models/service-company';
import {FormInput} from 'components/form/FormInput';

interface AutoDropdownProps {
  formik: any;
  t: any;
  theme: any;
  activeField: string;
  companyAutoNumberConfig: any;
  companyNextNumber: any;
  refetchCompanyNumber: () => void;
  setOpenDialog: (value: boolean) => void;
  customerResource: PropertyOwnerView[];
  handleFocus: any;
}

const AutoDropdown: React.FC<AutoDropdownProps> = ({
  formik,
  t,
  theme,
  activeField,
  companyAutoNumberConfig,
  companyNextNumber,
  refetchCompanyNumber,
  setOpenDialog,
  customerResource,
  handleFocus,
}) => {
  const defaultProps = {
    InputLabelProps: {shrink: true},
  };

  return (
    <>
      <FormInput
        props={{
          size: 'small',
          placeholder: 'e.g 1234',
          label: 'Customer Number',
          name: 'externalId',
          value: formik.values.externalId,
          helperText: formik.touched.externalId && formik.errors.externalId,
          error: !!formik.errors.externalId && formik.touched.externalId,
          ...defaultProps,
        }}
        handleFocus={handleFocus}
      />
      {(activeField === 'externalId' || formik.touched.externalId) &&
        formik.values.externalId &&
        customerResource.filter(
          (item) => item.externalId === formik.values.externalId,
        ).length > 0 && (
          <Typography
            color="error"
            fontSize="0.75rem"
            letterSpacing="0.03em"
            padding="0.45em 0.65em">
            {t('This ID is already taken. Please enter a different one.')}
          </Typography>
        )}
      {activeField === 'externalId' &&
      !formik.values.externalId &&
      companyAutoNumberConfig?.configRecords.find(
        (item: any) => item.type === ServiceCompanyNumberType.PROPERTY_OWNER,
      )?.enabled ? (
        <Box
          sx={{
            borderRadius: '4px',
            boxShadow: '0px 9px 46px 8px #0000001F',
            marginTop: '0.2em',
          }}>
          <Button
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              textAlign: 'left',
              alignItems: 'flex-start',
              width: '100%',
              padding: '1em 2em',
            }}
            onClick={() => {
              refetchCompanyNumber();
              formik.setFieldValue('externalId', companyNextNumber?.value);
            }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                paddingBottom: '0.6em',
              }}>
              <AutoAwesome />
              <Typography variant="subtitle2" sx={{paddingLeft: '0.5em'}}>
                {t('Generate ID')}
              </Typography>
            </Box>

            <Typography variant="body2" color={theme.palette.text.secondary}>
              {t('Customizable in Settings')}
            </Typography>
          </Button>
        </Box>
      ) : (
        activeField === 'externalId' &&
        !formik.values.externalId &&
        !companyAutoNumberConfig?.configRecords.find(
          (item: any) => item.type === ServiceCompanyNumberType.PROPERTY_OWNER,
        )?.enabled && (
          <Box
            sx={{
              borderRadius: '4px',
              boxShadow: '0px 9px 46px 8px #0000001F',
              marginTop: '0.2em',
            }}>
            <Button
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                textAlign: 'left',
                alignItems: 'flex-start',
                width: '100%',
                padding: '1em 2em',
              }}
              onClick={() => setOpenDialog(true)}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingBottom: '0.6em',
                }}>
                <AutoAwesome />
                <Typography variant="subtitle2" sx={{paddingLeft: '0.5em'}}>
                  {t('Enable Automatic ID Generation')}
                </Typography>
              </Box>

              <Typography variant="body2" color={theme.palette.text.secondary}>
                {t('Allows for easier number input')}
              </Typography>
            </Button>
          </Box>
        )
      )}
    </>
  );
};

export default AutoDropdown;
