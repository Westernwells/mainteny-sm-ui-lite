import {FormikProps} from 'formik';
import {TextField, Typography} from '@mui/material';
import Box from '@mui/material/Box';
import {CompleteServiceOrder, ServiceOrderView} from 'models/service-order';
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
  serviceOrder: ServiceOrderView;
  formik: FormikProps<CompleteServiceOrder & {serviceTimeHM: string}>;
}
export const Maintenance = ({serviceOrder, formik}: Props) => {
  const schedule = serviceOrder.schedules?.[serviceOrder.schedules.length - 1];
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
          <Box
            px="1rem"
            justifyContent="space-between"
            pt=".5rem"
            pb="1.5rem"
            display="flex">
            <Box
              maxWidth={500}
              display="flex"
              alignItems="center"
              gap={0.5}
              flex={1}>
              <DirectionsCar sx={{color: 'action.active'}} />
              <Typography variant="caption">{t('Travel')}</Typography>
            </Box>
            <Box
              maxWidth={500}
              display="flex"
              alignItems="center"
              gap={0.5}
              flex={1}>
              <Construction sx={{color: 'action.active'}} />
              <Typography variant="caption">{t('Work')}</Typography>
            </Box>
          </Box>
          <Box
            bgcolor="grey.50"
            boxShadow="0px 4px 15px 0px #90909033"
            p="1rem"
            flexDirection="column"
            display="flex"
            flexWrap="wrap">
            <Box
              display="flex"
              flex={1}
              columnGap={2}
              flexWrap="wrap"
              justifyContent="space-between">
              <ReportTimeEntries type="travel" formik={formik} />
              <ReportTimeEntries type="work" formik={formik} />
            </Box>
            <Box
              justifyContent="space-between"
              mt={3}
              columnGap={2}
              display="flex"
              flexWrap="wrap">
              <Box maxWidth={500} flex={1}>
                <Box mt={3} display="flex" alignItems="center">
                  <Box width={150}>
                    <Typography>{t('Travel time')}</Typography>
                  </Box>
                  <Box width={100}>
                    <Typography>{totalTravelFormatted}</Typography>
                  </Box>
                  <NumericFormat
                    value={formik.values.travelTimeRecord?.percentageSurcharge}
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
              <Box maxWidth={500} flex={1}>
                <Box mt={3} display="flex" alignItems="center">
                  <Box width={150}>
                    <Typography>{t('Work time')}:</Typography>
                  </Box>
                  <Box width={100}>
                    <Typography>{totalWorkFormatted}</Typography>
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
            </Box>

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
                {t('Billable hours')}:
              </Typography>
              <Box display="flex" flexDirection="column">
                <Typography color="white" fontWeight={700} flexShrink={0}>
                  {totalBillableHoursFormatted}
                </Typography>
              </Box>
            </Box>
            <FormCheckbox
              checked={formik.values.onlyShowTotalTime ?? false}
              name="onlyShowTotalTime"
              handleChange={formik.handleChange}
              label={t('Show only total time to the customer')}
              typographyProps={{fontWeight: 500}}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};
