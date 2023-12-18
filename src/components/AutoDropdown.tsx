import React, {useEffect, useRef} from 'react';
import {Typography, Box, Button, useTheme} from '@mui/material';
import {AutoAwesome} from '@mui/icons-material';
import {ServiceCompanyNumberType} from 'models/service-company';
import {FormInput} from 'components/form/FormInput';
import {useTranslation} from 'react-i18next';
import {
  useCompanyAutoNumberConfig,
  useCompanyNextNumber,
} from 'hooks/reactQuery/useCompanies';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {InvoiceView} from 'models/invoice';
import {ArticleSupplierView, ArticleView} from 'models/article';
import {ContractView} from 'models/contract';
import {PropertyOwnerView} from 'models/propertyManager';
import {UserData} from 'models/user';
import {ElevatorView} from 'models/elevator';

interface Props {
  formik: any;
  activeField: string;
  fieldProps: any;
  setOpenDialog: (value: boolean) => void;
  serviceTypeResource:
    | InvoiceView[]
    | ArticleView[]
    | ContractView[]
    | PropertyOwnerView[]
    | UserData[]
    | ArticleSupplierView[]
    | ElevatorView[];
  handleFocus: (e: any) => void;
  idContainerStyles?: {[key: string]: any};
  numberType: ServiceCompanyNumberType;
  setActiveField: () => void;
}

const AutoDropdown = ({
  formik,
  activeField,
  fieldProps,
  setOpenDialog,
  serviceTypeResource,
  handleFocus,
  idContainerStyles,
  numberType,
  setActiveField,
}: Props) => {
  const theme = useTheme();
  const {t} = useTranslation();

  const {user} = useUserSession();

  const {data: companyAutoNumberConfig} = useCompanyAutoNumberConfig(
    user?.userAccount.serviceCompany.id,
  );

  const {data: companyNextNumber, refetch: refetchCompanyNumber} =
    useCompanyNextNumber(
      {
        type: numberType,
      },
      user?.userAccount.serviceCompany.id,
    );

  const defaultProps = {
    InputLabelProps: {shrink: true},
  };

  const filteredResources = (serviceTypeResource as InvoiceView[]).filter(
    (item) => {
      if ('externalId' in item) {
        return item.externalId === formik.values[fieldProps.name];
      }
      return false;
    },
  );

  const isResourceFound = filteredResources.length > 0;

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setActiveField();
      }
    };
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [setActiveField]);

  return (
    <Box ref={ref}>
      <FormInput
        containerStyles={{...idContainerStyles}}
        props={{
          ...fieldProps,
          ...defaultProps,
        }}
        handleFocus={handleFocus}
      />
      {(activeField === fieldProps.name || formik.touched[fieldProps.name]) &&
        formik.values[activeField] &&
        isResourceFound && (
          <Typography
            color="error"
            fontSize="0.75rem"
            letterSpacing="0.03em"
            padding="0.45em 0.65em">
            {t('This ID is already taken. Please enter a different one.')}
          </Typography>
        )}
      {activeField === fieldProps.name &&
      !formik.values[fieldProps.name] &&
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
              formik.setFieldValue(fieldProps.name, companyNextNumber?.value);
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
        activeField === fieldProps.name &&
        !formik.values[fieldProps.name] &&
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
    </Box>
  );
};

export default AutoDropdown;
