import {
  Box,
  Divider,
  IconButton,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {DatePicker} from 'components/DatePicker';
import {TimePicker} from 'components/TimePicker';
import {FormikProps} from 'formik';
import {
  CompleteServiceOrder,
  ServiceOrderReportTimeRecord,
  ServiceOrderTimeSlot,
} from 'models/service-order';
import {useTranslation} from 'react-i18next';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {Button} from 'components/Button';
import AddIcon from '@mui/icons-material/Add';
import {PatternFormat} from 'react-number-format';
import {useEffect, useState} from 'react';
import {
  convertHoursAndMinutesToMinutes,
  convertMinutesToHoursAndMinutes,
} from 'utils/work-hours-utils';
import {addDateToTime, addTimeToDate} from 'utils/utils';
import _ from 'lodash';
import {addDays, isSameDay, startOfDay, subDays} from 'date-fns';
import {useFormatDate} from 'hooks/useFormatDate';

interface Props {
  formik: FormikProps<CompleteServiceOrder & {serviceTimeHM: string}>;
  type: 'work' | 'travel';
  isEdit: boolean;
  totalTravelFormatted: string;
  totalWorkFormatted: string;
}

const ReportTimeEntries = ({
  formik,
  type,
  isEdit,
  totalTravelFormatted,
  totalWorkFormatted,
}: Props) => {
  const {t} = useTranslation();
  const formatDate = useFormatDate();
  const timeRecordKey = type === 'work' ? 'workTimeRecord' : 'travelTimeRecord';
  const timeInfo = formik.values[timeRecordKey] as ServiceOrderReportTimeRecord;
  const [timeRawValues, setTimeRawValues] = useState<string[]>([]);
  const theme = useTheme();
  const isSmallerThan1180 = useMediaQuery(theme.breakpoints.down(1180));
  const DATE_SECTION_WIDTH = isSmallerThan1180 ? 125 : 150;
  const TIME_SECTION_WIDTH = isSmallerThan1180 ? 95 : 120;
  const DURATION_SECTION_WIDTH = isSmallerThan1180 ? 65 : 80;

  useEffect(() => {
    setTimeRawValues(
      timeInfo.timeSlots.map((slot) =>
        convertMinutesToHoursAndMinutes(slot.minutes ?? 0, {hourUnit: ''}),
      ),
    );
  }, [timeInfo]);

  const handleOnDelete = (index: number) => {
    const dataClone = _.cloneDeep(timeInfo);
    dataClone.timeSlots.splice(index, 1);

    formik.setFieldValue(timeRecordKey, dataClone);
  };

  const handleOnAddTime = () => {
    const sortedTimeSlots = _.sortBy(timeInfo.timeSlots, (obj) =>
      new Date(obj.startTime).getTime(),
    ).reverse();

    const latestTime = sortedTimeSlots?.[0]?.startTime
      ? startOfDay(new Date(sortedTimeSlots?.[0]?.startTime))
      : subDays(new Date(), 1);

    const newSlot: ServiceOrderTimeSlot = {
      startTime: addDays(latestTime, 1).toISOString(),
      minutes: 0,
    };

    formik.setFieldValue(timeRecordKey, {
      ...timeInfo,
      timeSlots: [...timeInfo.timeSlots, newSlot],
    });
  };

  const renderEntry = (slot: ServiceOrderTimeSlot, index: number) => {
    const date = new Date(slot.startTime);
    return (
      <Box key={slot.startTime} display="flex" my={2} columnGap={1}>
        <Box width={DATE_SECTION_WIDTH}>
          {isEdit ? (
            <DatePicker
              getSelectedDate={(newDate) => {
                if (newDate) {
                  const newDateTime = addDateToTime(
                    timeInfo.timeSlots[index].startTime,
                    newDate,
                  );
                  formik.setFieldValue(
                    `${timeRecordKey}.timeSlots[${index}].startTime`,
                    newDateTime,
                  );
                }
              }}
              shouldDisableDate={(tDate) =>
                timeInfo.timeSlots.some((d) => {
                  const slotDate = new Date(d.startTime);

                  if (isSameDay(date, slotDate)) {
                    return false;
                  }

                  return isSameDay(slotDate, tDate);
                })
              }
              defaultDate={date}
              textFieldProps={{
                name: 'date',
                label: '',
                onBlur: formik.handleBlur,

                sx: isSmallerThan1180
                  ? {
                      '& .MuiInputBase-input': {
                        fontSize: '12px',
                        fontWeight: '600',
                      },
                      '& .MuiSvgIcon-root': {
                        width: '0.8em',
                        height: '0.8em',
                      },
                    }
                  : {},
              }}
            />
          ) : (
            <Typography>{formatDate(date)}</Typography>
          )}
        </Box>
        <Box width={TIME_SECTION_WIDTH}>
          {isEdit ? (
            <TimePicker
              defaultTime={date}
              getSelectedTime={(newTime) => {
                if (newTime) {
                  const newDateTime = addTimeToDate(
                    timeInfo.timeSlots[index].startTime,
                    newTime,
                  );
                  formik.setFieldValue(
                    `${timeRecordKey}.timeSlots[${index}].startTime`,
                    newDateTime,
                  );
                }
              }}
              textFieldProps={{
                name: 'startTime',
                label: '',
                onBlur: formik.handleBlur,
                sx: isSmallerThan1180
                  ? {
                      '& .MuiInputBase-input': {
                        fontSize: '12px',
                      },
                      '& .MuiSvgIcon-root': {
                        width: '0.8em',
                        height: '0.8em',
                      },
                    }
                  : {},
              }}
            />
          ) : (
            <Typography textAlign="end">{formatDate(date, 'HH:mm')}</Typography>
          )}
        </Box>
        <Box width={!isEdit ? TIME_SECTION_WIDTH : DURATION_SECTION_WIDTH}>
          {isEdit ? (
            <PatternFormat
              value={timeRawValues[index] ?? '00:00'}
              size="small"
              allowEmptyFormatting
              onBlur={formik.handleBlur}
              sx={{
                width: '100%',
                input: {
                  fontWeight: 700,
                  fontSize: isSmallerThan1180 ? '12px' : undefined,
                },
              }}
              onChange={(e) => {
                const valuesClone = [...timeRawValues];
                valuesClone[index] = e.target.value;

                setTimeRawValues(valuesClone);

                formik.setFieldValue(
                  `${timeRecordKey}.timeSlots[${index}].minutes`,
                  convertHoursAndMinutesToMinutes(e.target.value),
                );
              }}
              customInput={TextField}
              format="##:##"
            />
          ) : (
            <Typography textAlign="end">{timeRawValues[index]}</Typography>
          )}
        </Box>
        {isEdit && (
          <IconButton size="small" onClick={() => handleOnDelete(index)}>
            <DeleteOutlineIcon />
          </IconButton>
        )}
      </Box>
    );
  };

  return (
    <Box flex={1} maxWidth={500}>
      <Box mb={3} display="flex" columnGap={1}>
        <Box width={DATE_SECTION_WIDTH}>
          <Typography variant="caption">{t('Date')}</Typography>
        </Box>
        <Box
          width={TIME_SECTION_WIDTH}
          sx={{textAlign: !isEdit ? 'end' : 'start'}}>
          <Typography variant="caption">{t('Start time')}</Typography>
        </Box>
        <Box
          width={TIME_SECTION_WIDTH}
          sx={{textAlign: !isEdit ? 'end' : 'start'}}>
          <Typography variant="caption">
            {type === 'work' ? t('Hours worked') : t('Hours traveled')}
          </Typography>
        </Box>
      </Box>
      {timeInfo.timeSlots.map((item, index) => renderEntry(item, index))}
      {!isEdit && (
        <>
          <Divider
            sx={{maxWidth: 430, borderColor: '#8F9BB380', py: '0.1em'}}
          />
          <Box
            justifyContent="space-between"
            mt={2}
            columnGap={2}
            display="flex"
            flexWrap="wrap">
            {type === 'work' ? (
              <Box maxWidth={465} flex={1}>
                <Box
                  display="flex"
                  alignItems="center"
                  flexDirection="column"
                  gap={1}>
                  <Box
                    display="flex"
                    alignItems="center"
                    sx={{width: '100%'}}
                    justifyContent="space-between">
                    <Box width={150}>
                      <Typography variant="caption">
                        {t('Work time')}:
                      </Typography>
                    </Box>
                    <Box width={100}>
                      <Typography>{totalWorkFormatted}</Typography>
                    </Box>
                  </Box>
                  <Box
                    display="flex"
                    alignItems="center"
                    sx={{width: '100%'}}
                    justifyContent="space-between">
                    <Box width={150}>
                      <Typography variant="caption">
                        {t('Surcharge')}:
                      </Typography>
                    </Box>
                    <Box width={100}>
                      <Typography>
                        {formik.values.workTimeRecord?.percentageSurcharge}%
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            ) : (
              <Box maxWidth={465} flex={1}>
                <Box
                  display="flex"
                  alignItems="center"
                  flexDirection="column"
                  gap={1}>
                  <Box
                    display="flex"
                    alignItems="center"
                    sx={{width: '100%'}}
                    justifyContent="space-between">
                    <Box width={150}>
                      <Typography variant="caption">
                        {t('Travel time')}
                      </Typography>
                    </Box>
                    <Box width={100}>
                      <Typography>{totalTravelFormatted}</Typography>
                    </Box>
                  </Box>
                  <Box
                    display="flex"
                    alignItems="center"
                    sx={{width: '100%'}}
                    justifyContent="space-between">
                    <Box width={150}>
                      <Typography variant="caption">
                        {t('Surcharge')}
                      </Typography>
                    </Box>
                    <Box width={100}>
                      <Typography>
                        {formik.values.travelTimeRecord?.percentageSurcharge}%
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        </>
      )}

      {isEdit && (
        <Box mt={3}>
          <Button
            buttonProps={{
              onClick: handleOnAddTime,
              sx: {
                textTransform: 'inherit',
                backgroundColor: 'transparent',
              },
              variant: 'outlined',
              color: 'primary',
              size: 'small',
              startIcon: <AddIcon />,
            }}>
            <Typography variant="body1" sx={{textTransform: 'inherit'}}>
              {type === 'work' ? t('Add Work') : t('Add Travel')}
            </Typography>
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ReportTimeEntries;
