import React from 'react';
import {Typography, Box, Button, useTheme} from '@mui/material';
import {AutoAwesome} from '@mui/icons-material';
import {PropertyOwnerView} from 'models/propertyManager';
import {ServiceCompanyNumberType} from 'models/service-company';
import {FormInput} from 'components/form/FormInput';
import {ArticleView} from 'models/article';
import {ElevatorView} from 'models/elevator';
import {useTranslation} from 'react-i18next';

interface AutoDropdownProps {
  formik: any;
  activeField: string;
  fieldProps: any;
  companyAutoNumberConfig: any;
  companyNextNumber: any;
  refetchCompanyNumber: () => void;
  setOpenDialog: (value: boolean) => void;
  customerResource: PropertyOwnerView[] | ArticleView[] | ElevatorView[];
  handleFocus: any;
  idContainerStyles?: {[key: string]: any};
  numberType: ServiceCompanyNumberType;
}

const AutoDropdown: React.FC<AutoDropdownProps> = ({
  formik,
  activeField,
  fieldProps,
  companyAutoNumberConfig,
  companyNextNumber,
  refetchCompanyNumber,
  setOpenDialog,
  customerResource,
  handleFocus,
  idContainerStyles,
  numberType,
}) => {
  const theme = useTheme();
  const {t} = useTranslation();

  const defaultProps = {
    InputLabelProps: {shrink: true},
  };

  return (
    <>
      <FormInput
        containerStyles={{...idContainerStyles}}
        props={{
          ...fieldProps,
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
        (item: any) => item.type === numberType,
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
          (item: any) => item.type === numberType,
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
