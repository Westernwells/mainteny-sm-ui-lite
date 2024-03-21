import {FormikProps} from 'formik';
import {Divider, TextField, Typography} from '@mui/material';
import Box from '@mui/material/Box';
import {
  CompleteServiceOrder,
  ServiceOrderScheduleSimpleView,
} from 'models/service-order';
import {useTranslation} from 'react-i18next';
import {Construction, DirectionsCar} from '@mui/icons-material';
import {FormLabel} from 'components/form/FormLabel';
import {FormCheckbox} from 'components/form/FormCheckbox';
import useTheme from '@mui/material/styles/useTheme';

import {
  calculateSlotTotalWithoutSurcharge,
  calculateTotalBillableHours,
} from 'utils/service-order-utils';
import {convertMinutesToHoursAndMinutes} from 'utils/work-hours-utils';
import {NumericFormat} from 'react-number-format';
import {useContext, useMemo} from 'react';
import {LanguageContext} from 'context/LanguageProvider';
import ReportTimeEntries from './ReportTimeEntries';

interface Props {
  formik: FormikProps<CompleteServiceOrder & {serviceTimeHM: string}>;
  isEdit: boolean;
  schedule?: ServiceOrderScheduleSimpleView;
}
export const Maintenance = ({schedule, formik, isEdit}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const {language: selectedLng} = useContext(LanguageContext);

  const totalBillableHours = calculateTotalBillableHours([
    formik.values.workTimeRecord!,
    formik.values.travelTimeRecord!,
  ]);

  const totalBillableHoursFormatted = convertMinutesToHoursAndMinutes(
    totalBillableHours,
    {hourUnit: t('h')},
  );

  const totalTravelFormatted = useMemo(() => {
    const totalTravelWithoutSurcharge = calculateSlotTotalWithoutSurcharge(
      formik.values.travelTimeRecord,
    );
    return convertMinutesToHoursAndMinutes(totalTravelWithoutSurcharge, {
      hourUnit: t('h'),
    });
  }, [formik.values.travelTimeRecord]);

  const totalWorkFormatted = useMemo(() => {
    const totalWorkWithoutSurcharge = calculateSlotTotalWithoutSurcharge(
      formik.values.workTimeRecord,
    );
    return convertMinutesToHoursAndMinutes(totalWorkWithoutSurcharge, {
      hourUnit: t('h'),
    });
  }, [formik.values.workTimeRecord]);

  const renderHeader = () => (
    <Box
      sx={{
        pt: '.5rem',
        pb: '1.5rem',
        px: isEdit ? '1rem' : 'unset',
      }}
      justifyContent="space-between"
      pt=".5rem"
      pb="1.5rem"
      display="flex">
      <Box maxWidth={500} display="flex" alignItems="center" gap={0.5} flex={1}>
        <Construction sx={{color: 'action.active'}} />
        <Typography variant="caption">{t('Work')}</Typography>
      </Box>
      <Box maxWidth={500} display="flex" alignItems="center" gap={0.5} flex={1}>
        <DirectionsCar sx={{color: 'action.active'}} />
        <Typography variant="caption">{t('Travel')}</Typography>
      </Box>
    </Box>
  );

  return (
    <Box mt="1em">
      <FormLabel text="Maintenance" />
      {schedule && (
        <Box
          bgcolor="grey.50"
          border="1px solid"
          borderColor="grey.300"
          borderRadius="4px"
          p=".5em">
          {isEdit && renderHeader()}
          <Box
            bgcolor="grey.50"
            boxShadow="0px 4px 15px 0px #90909033"
            p="1rem"
            flexDirection="column"
            display="flex"
            flexWrap="wrap">
            {!isEdit && renderHeader()}
            <Box
              display="flex"
              flex={1}
              columnGap={2}
              flexWrap="wrap"
              justifyContent="space-between">
              <ReportTimeEntries
                type="work"
                formik={formik}
                isEdit={isEdit}
                totalTravelFormatted={totalTravelFormatted}
                totalWorkFormatted={totalWorkFormatted}
              />
              <ReportTimeEntries
                type="travel"
                formik={formik}
                isEdit={isEdit}
                totalTravelFormatted={totalTravelFormatted}
                totalWorkFormatted={totalWorkFormatted}
              />
            </Box>
            {isEdit && (
              <Box
                justifyContent="space-between"
                mt={3}
                columnGap={2}
                display="flex"
                flexWrap="wrap">
                <Box maxWidth={500} flex={1}>
                  <Box mt={3} display="flex" alignItems="center">
                    <Box width={150}>
                      <Typography fontWeight={600}>
                        {t('Work time')}:
                      </Typography>
                    </Box>
                    <Box width={100}>
                      <Typography fontWeight={600}>
                        {' '}
                        {totalWorkFormatted}
                      </Typography>
                    </Box>
                    <NumericFormat
                      value={formik.values.workTimeRecord?.percentageSurcharge}
                      customInput={TextField}
                      suffix="%"
                      label={t('Surcharge')}
                      allowLeadingZeros={false}
                      decimalScale={2}
                      decimalSeparator={
                        selectedLng === 'DE' || selectedLng === 'SR' ? ',' : '.'
                      }
                      thousandSeparator={
                        selectedLng === 'DE' || selectedLng === 'SR' ? '.' : ','
                      }
                      sx={{
                        width: 100,
                        '& .MuiInputBase-root': {
                          pr: 0,
                        },
                        '& .MuiOutlinedInput-input': {
                          textAlign: 'right',
                          fontWeight: 600,
                        },
                      }}
                      InputProps={{
                        inputMode: 'numeric',
                      }}
                      onValueChange={(values) => {
                        const {floatValue} = values;
                        formik.setFieldValue(
                          `workTimeRecord.percentageSurcharge`,
                          floatValue ?? 0,
                        );
                      }}
                      size="small"
                    />
                  </Box>
                </Box>
                <Box maxWidth={500} flex={1}>
                  <Box mt={3} display="flex" alignItems="center">
                    <Box width={150}>
                      <Typography fontWeight={600}>
                        {t('Travel time')}
                      </Typography>
                    </Box>
                    <Box width={100}>
                      <Typography fontWeight={600}>
                        {totalTravelFormatted}
                      </Typography>
                    </Box>
                    <NumericFormat
                      value={
                        formik.values.travelTimeRecord?.percentageSurcharge
                      }
                      customInput={TextField}
                      suffix="%"
                      label={t('Surcharge')}
                      allowLeadingZeros={false}
                      decimalScale={2}
                      decimalSeparator={
                        selectedLng === 'DE' || selectedLng === 'SR' ? ',' : '.'
                      }
                      thousandSeparator={
                        selectedLng === 'DE' || selectedLng === 'SR' ? '.' : ','
                      }
                      sx={{
                        width: 100,
                        '& .MuiInputBase-root': {
                          pr: 0,
                        },
                        '& .MuiOutlinedInput-input': {
                          textAlign: 'right',
                          fontWeight: 600,
                        },
                      }}
                      InputProps={{
                        inputMode: 'numeric',
                      }}
                      onValueChange={(values) => {
                        const {floatValue} = values;
                        formik.setFieldValue(
                          `travelTimeRecord.percentageSurcharge`,
                          floatValue ?? 0,
                        );
                      }}
                      size="small"
                    />
                  </Box>
                </Box>
              </Box>
            )}

            {isEdit && (
              <Box
                display="flex"
                gap={5}
                alignItems="center"
                flexBasis="100%"
                bgcolor={theme.palette.grey[700]}
                borderRadius={1}
                mb={2}
                mt={3}
                py={1}
                px={2}>
                <Typography color="white" fontWeight={700} flexShrink={0}>
                  {t('Billable hours:')}
                </Typography>
                <Box display="flex" flexDirection="column">
                  <Typography color="white" fontWeight={700} flexShrink={0}>
                    {totalBillableHoursFormatted}
                  </Typography>
                </Box>
              </Box>
            )}

            {isEdit && (
              <FormCheckbox
                checked={formik.values.onlyShowTotalTime ?? false}
                name="onlyShowTotalTime"
                handleChange={formik.handleChange}
                label={t('Show only total time to the customer')}
                typographyProps={{fontWeight: 600}}
              />
            )}
          </Box>
          {!isEdit && (
            <>
              <Divider
                sx={{width: '100%', borderColor: '#8F9BB380', py: '0.5em'}}
              />
              <Box
                display="flex"
                gap={5}
                alignItems="center"
                flexBasis="100%"
                bgcolor={theme.palette.grey[700]}
                borderRadius={1}
                mb={2}
                mt={2}
                py={1}
                px={2}>
                <Typography color="white" fontWeight={700} flexShrink={0}>
                  {t('Billable hours:')}
                </Typography>
                <Box display="flex" flexDirection="column">
                  <Typography color="white" fontWeight={700} flexShrink={0}>
                    {totalBillableHoursFormatted}
                  </Typography>
                </Box>
              </Box>
            </>
          )}
        </Box>
      )}
    </Box>
  );
};
