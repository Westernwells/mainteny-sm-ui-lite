import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import {
  useCompanyAutoNumberConfig,
  useCompanyNextNumber,
} from 'hooks/reactQuery/useCompanies';
import {AutoAwesome} from '@mui/icons-material';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {ServiceCompanyNumberType} from 'models/service-company';
import {useTranslation} from 'react-i18next';
import {theme} from 'theme';
import {Dispatch, SetStateAction} from 'react';
import {ContractView} from 'models/contract';
import {UserData} from 'models/user';
import {ArticleSupplierView, ArticleView} from 'models/article';
import {ElevatorView} from 'models/elevator';
import {PropertyOwnerView} from 'models/propertyManager';
import {FormInput} from './form/FormInput';

type Props = {
  formik: any;
  initId?: string;
  fieldProps: any;
  serviceTypeResource:
    | ContractView[]
    | ArticleView[]
    | ArticleSupplierView[]
    | ElevatorView[]
    | PropertyOwnerView[]
    | UserData[];
  activeField: string;
  numberType: ServiceCompanyNumberType;
  idContainerStyles?: {[key: string]: any};
  handleFocus: any;
  setOpenNewDialog: Dispatch<SetStateAction<boolean>>;
};

const AutoEditDropdown = ({
  formik,
  initId,
  fieldProps,
  serviceTypeResource,
  activeField,
  numberType,
  idContainerStyles,
  handleFocus,
  setOpenNewDialog,
}: Props) => {
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
      {(activeField === fieldProps.name || formik.touched[fieldProps.name]) &&
        formik.values[fieldProps.name] &&
        initId !== formik.values[fieldProps.name] &&
        serviceTypeResource.filter(
          (item) => item.externalId === formik.values[fieldProps.name],
        ).length > 0 && (
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
        (item) => item.type === numberType,
      )?.enabled ? (
        <Box
          sx={{
            borderRadius: '4px',
            boxShadow: '0px 9px 46px 8px #0000001F',
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
          (item) => item.type === numberType,
        )?.enabled && (
          <Box
            sx={{
              borderRadius: '4px',
              boxShadow: '0px 9px 46px 8px #0000001F',
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
              onClick={() => setOpenNewDialog(true)}>
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

export default AutoEditDropdown;
