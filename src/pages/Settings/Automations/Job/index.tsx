import {Typography, Grid, Box, Tooltip, SelectChangeEvent} from '@mui/material';
import {InfoCard} from 'components/InfoCard';
import {t} from 'i18next';
import {ReactComponent as JobsIconGray} from 'assets/icons/JobsIconGray.svg';
import {ReactComponent as AlertInfoIcon} from 'assets/icons/AlertInfo.svg';
import {FormSelect} from 'components/form/FormSelect';
import {useFormik} from 'formik';
import {useUpdateCompany} from 'hooks/reactQuery/useCompanies';
import {MinToStep, ServiceCompanyItem} from 'models/service-company';
import {Switch} from 'components/Switch';
import {generateOptions, generateMinStepOptions} from 'utils/settings';
import {SxProps} from '@mui/system';

type Props = {
  company: ServiceCompanyItem;
  containerStyles?: SxProps;
};

const Job = ({company, containerStyles}: Props) => {
  const {mutateAsync: updateCompany} = useUpdateCompany(
    'Job Automation Settings Updated',
  );

  const formik = useFormik({
    initialValues: {
      serviceOrderGenerationEnabled:
        company.settings.serviceOrderGenerationEnabled ?? false,
      serviceOrderGenerationDaysInAdvance:
        company.settings.serviceOrderGenerationDaysInAdvance ?? 15,
      minToHourStep: company.settings.minToHourStep ?? MinToStep.STEP_30,
    },
    onSubmit: () => {},
  });

  const handleSave = async (options: any) => {
    await updateCompany({
      body: options,
      companyId: company?.id || '',
    });
  };

  const handleDaysBeforeNewMonthChange = async (
    event: SelectChangeEvent<string | string[]>,
  ) => {
    const selectedValue = event.target.value as string;
    await handleSave({
      serviceOrderGenerationDaysInAdvance: Number(selectedValue),
    });
    formik.setFieldValue(
      'serviceOrderGenerationDaysInAdvance',
      Number(selectedValue),
    );
  };

  const handleJobHoursChange = async (
    event: SelectChangeEvent<string | string[]>,
  ) => {
    const selectedValue = event.target.value as string;
    await handleSave({minToHourStep: Number(selectedValue)});
    formik.setFieldValue('minToHourStep', selectedValue);
  };

  return (
    <InfoCard
      header={<Typography variant="h5">{t('Job')}</Typography>}
      showHeaderBackground={false}
      containerStyles={{
        height: 'fit-content',
        ...containerStyles,
      }}
      headerIcon={<JobsIconGray width="1.5rem" height="1.5rem" />}>
      <Grid container direction="column" gap={2}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <Typography
            variant="subtitle2"
            sx={{
              flex: '0 0 80%',
              display: 'flex',
              alignItems: 'center',
            }}>
            {t('Automatically create jobs from contracts')}
            <Tooltip
              title={t(
                'You can turn on & off the automatic job creation for the entire company. If turned on, the jobs will be created automatically based on the settings for each contract.',
              )}
              placement="top"
              arrow>
              <Box sx={{ml: 0.5, mb: -0.7}}>
                <AlertInfoIcon width="16px" height="16px" />
              </Box>
            </Tooltip>
          </Typography>

          <Switch
            value={formik.values.serviceOrderGenerationEnabled}
            onChanged={async (value) => {
              await handleSave({serviceOrderGenerationEnabled: value});
              formik.setFieldValue('serviceOrderGenerationEnabled', value);
            }}
          />
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <Typography
            variant="subtitle2"
            sx={{
              flex: '0 0 80%',
              display: 'flex',
              alignItems: 'center',
            }}>
            {t(
              'How many days before the new month should the system create the jobs (0-60 days):',
            )}
            <Tooltip
              title={t(
                'E.g. If you select 15 days, the system will create all jobs for May on the 15th of April. If you select 0 days, the jobs will be created 1st of May.',
              )}
              placement="top"
              arrow>
              <Box sx={{ml: 0.5, mb: -0.7}}>
                <AlertInfoIcon width="16px" height="16px" />
              </Box>
            </Tooltip>
          </Typography>

          <FormSelect
            labelId="dayJob-label"
            label=""
            options={generateOptions()}
            selectProps={{
              id: 'daysJob-label',
              value: String(formik.values.serviceOrderGenerationDaysInAdvance),
              onChange: handleDaysBeforeNewMonthChange,
              name: 'daysJob',
            }}
            selectStyles={{
              '& .MuiSelect-select': {
                py: 1,
                typography: 'body2',
              },
            }}
          />
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <Typography
            variant="subtitle2"
            sx={{
              flex: '0 0 80%',
              display: 'flex',
              alignItems: 'center',
            }}>
            {t('Round job hours in work reports to full:')}
            <Tooltip
              title={t(
                'The time tracked by the engineers can be round up automatically. E.g. engineer tracks 17min (round up to full 15min), then the work report shows 30min.',
              )}
              placement="top"
              arrow>
              <Box sx={{ml: 0.5, mb: -0.7}}>
                <AlertInfoIcon width="16px" height="16px" />
              </Box>
            </Tooltip>
          </Typography>

          <FormSelect
            labelId="jobHours-label"
            label=""
            options={generateMinStepOptions()}
            selectProps={{
              id: 'jobHours-label',
              value: String(formik.values.minToHourStep),
              onChange: handleJobHoursChange,
              name: 'jobHours',
            }}
            selectStyles={{
              '& .MuiSelect-select': {
                py: 1,
                typography: 'body2',
              },
            }}
          />
        </Box>
      </Grid>
    </InfoCard>
  );
};

export default Job;
