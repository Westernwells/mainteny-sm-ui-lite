import {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {Box} from '@mui/system';
import Grid from '@mui/material/Grid';
import {useFormik} from 'formik';
import useTheme from '@mui/material/styles/useTheme';
import {PageCard} from 'components/PageCard';
import {AdditionalInformationEmployeeFormModel} from 'models/employee';
import {SelectServiceOrderTypes} from 'pages/EmployeeDetails/Tabs/EmployeeOverview/EditEmployeeForm/SelectServiceOrderTypes';
import {Typography} from '@mui/material';
import {Role} from 'models/user';
import {SelectShift} from 'pages/EmployeeDetails/Tabs/EmployeeOverview/EditEmployeeForm/SelectShift';
import {convertToMacro} from 'utils/utils';
import {ServiceOrderTypeRecord} from 'models/service-order';

interface Props {
  getAdditionalInformationEmployeeFormValues?: (
    val: AdditionalInformationEmployeeFormModel,
  ) => void;
  initialValues?: AdditionalInformationEmployeeFormModel;
  roles: string[];
  jobTypes?: ServiceOrderTypeRecord[];
}

export const AdditionalInformationEmployeeForm = ({
  getAdditionalInformationEmployeeFormValues,
  initialValues,
  roles,
  jobTypes,
}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();

  const formik = useFormik<AdditionalInformationEmployeeFormModel>({
    initialValues: {
      serviceOrderTypes: initialValues?.serviceOrderTypes || [],
      shifts: initialValues?.shifts || [],
    },
    onSubmit: () => {},
  });

  useEffect(() => {
    if (getAdditionalInformationEmployeeFormValues) {
      getAdditionalInformationEmployeeFormValues(formik.values);
    }
  }, [formik]);

  return (
    <PageCard
      headerLabel="Work Preferences"
      containerStyles={{flexGrow: 1}}
      headerStyles={{mt: '0.5em'}}>
      <Box sx={{mt: '0.5em'}} component="form">
        <Grid container spacing={2}>
          <Grid item md={12}>
            {(convertToMacro(roles[0]).includes(Role.TECHNICIAN) ||
              convertToMacro(roles[0]).includes(Role.CONTRACTOR) ||
              (convertToMacro(roles[0]).includes(Role.TECHNICIAN) &&
                convertToMacro(roles[0]).includes(Role.SERVICE_MANAGER))) && (
              <Box sx={{marginBottom: '1.250em'}}>
                <Typography
                  sx={{
                    color: theme.palette.text.primary,
                    marginBottom: '0.313em',
                  }}>
                  {t('Order Types')}
                </Typography>
                <SelectServiceOrderTypes
                  values={formik.values}
                  setFieldValue={formik.setFieldValue}
                  jobTypes={jobTypes}
                />
              </Box>
            )}

            <Typography
              sx={{color: theme.palette.text.primary, marginBottom: '0.313em'}}>
              {t('Shift Time')}
              <Typography component="span" sx={{color: 'red'}}>
                *
              </Typography>
            </Typography>
            <SelectShift
              values={formik.values}
              setFieldValue={formik.setFieldValue}
            />
          </Grid>
        </Grid>
      </Box>
    </PageCard>
  );
};
