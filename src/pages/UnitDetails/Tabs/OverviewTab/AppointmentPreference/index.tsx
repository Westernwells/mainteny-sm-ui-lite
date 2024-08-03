import useTheme from '@mui/material/styles/useTheme';
import Typography from '@mui/material/Typography';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import {ReactComponent as CalendarInformationIcon} from 'assets/icons/CalendarInformationIcon.svg';
import {
  ElevatorView,
  ElevatorTimeRuleView,
  ElevatorTimeRuleType,
  DaysTimeRange,
} from 'models/elevator';
import {useTranslation} from 'react-i18next';
import Grid from '@mui/material/Grid';
import {InfoCard} from 'components/InfoCard';
import {useEffect, useRef, useState} from 'react';
import {useUpdateElevator} from 'hooks/reactQuery/useElevator';
import {titleCase} from 'utils/utils';
import {Dialog} from 'components/Dialog';
import {AppointmentFormModel} from 'models/unitForm';
import {useForm} from 'react-hook-form';
import {EditAppointmentForm, mapDaysOfWeekOptions} from './EditAppointmentForm';
import {AppointmentShema} from './AppointmentShema';

interface Props {
  containerStyles?: {[key: string]: any};
  elevator: ElevatorView;
  propertyOwnerId?: string;
}

const parseTimeRulesData = (timeRules: ElevatorTimeRuleView[]) => {
  const daysOfWeekAndTimeRangeTimeRule = timeRules?.find(
    (timeRule) =>
      timeRule.type === ElevatorTimeRuleType.DAYS_OF_WEEK_AND_TIME_RANGE,
  );
  if (!daysOfWeekAndTimeRangeTimeRule) return null;

  const parsedData = (
    JSON.parse(daysOfWeekAndTimeRangeTimeRule.data) as DaysTimeRange[]
  )[0];

  return parsedData;
};

const removeSecondsFromTimeString = (time: string) =>
  time.slice(0, time.lastIndexOf(':'));

export const AppointmentPreference = ({
  containerStyles,
  elevator,
  propertyOwnerId,
}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const {mutateAsync: updateElevator} = useUpdateElevator(
    'Appointment preference updated successfully',
  );
  const parsedTimeRulesData = parseTimeRulesData(elevator.timeRules);

  const labels = useRef([
    'daysOfWeek',
    'openingHours',
    'requiresAppointment',
    'requiresNotification',
    'notificationDue',
  ]).current;

  const getDefaultValues = (elevatorData: ElevatorView) => ({
    appointmentDaysOfWeek:
      parsedTimeRulesData?.daysOfWeek.map((val) => titleCase(val)) ?? [],
    openingHour: parsedTimeRulesData?.timeRange.start ?? '',
    closingHour: parsedTimeRulesData?.timeRange.end ?? '',
    shouldNotifyCustomer:
      elevatorData.additionalInfo?.customerAppointment?.shouldNotifyCustomer ??
      false,
    appointmentNotificationDue:
      elevatorData.additionalInfo?.customerAppointment
        ?.appointmentNotificationDue ?? 0,
    requiresAppointment:
      elevatorData.additionalInfo?.customerAppointment?.requiresAppointment ??
      false,
  });

  const {watch, register, handleSubmit, setValue, reset} =
    useForm<AppointmentFormModel>({
      defaultValues: getDefaultValues(elevator),
      mode: 'all',
    });

  useEffect(() => {
    reset(getDefaultValues(elevator));
  }, [elevator]);

  const onSave = async (data: AppointmentFormModel) => {
    setOpenDialog(false);
    await updateElevator({
      body: {
        propertyOwnerId,
        ...(data.openingHour &&
          data.closingHour && {
            timeRule: {
              daysTimeRange: [
                {
                  daysOfWeek: data.appointmentDaysOfWeek.map((val) =>
                    mapDaysOfWeekOptions[
                      val as keyof typeof mapDaysOfWeekOptions
                    ].toUpperCase(),
                  ),
                  timeRange: {
                    start: data.openingHour || '',
                    end: data.closingHour || '',
                  },
                },
              ],
            },
          }),
        customerAppointment: {
          shouldNotifyCustomer: data.shouldNotifyCustomer,
          appointmentNotificationDue: data.appointmentNotificationDue,
          requiresAppointment: data.requiresAppointment,
        },
      },
      elevatorId: elevator.id,
    });
  };

  return (
    <InfoCard
      containerStyles={{...containerStyles}}
      handleAction={() => setOpenDialog(true)}
      headerIcon={
        <CalendarInformationIcon style={{width: '2rem', height: '2rem'}} />
      }
      header={
        <Typography variant="h5">{t('Appointment Preferences')}</Typography>
      }
      headerActionIcon={
        <EditOutlinedIcon style={{color: theme.palette.secondary.mainLight}} />
      }
      bodyContainerStyle={{
        overflowY: 'hidden',
      }}>
      <Grid container spacing={2}>
        {labels.map((label) => (
          <Grid key={label} item xs={12} sm={4} md={4}>
            <AppointmentShema
              label={label}
              elevator={elevator}
              openingHours={
                parsedTimeRulesData?.timeRange
                  ? `${removeSecondsFromTimeString(
                      parsedTimeRulesData?.timeRange.start,
                    )} - ${removeSecondsFromTimeString(
                      parsedTimeRulesData?.timeRange.end,
                    )}`
                  : '-'
              }
              daysOfWeek={
                parsedTimeRulesData?.daysOfWeek
                  ? parsedTimeRulesData?.daysOfWeek
                      .map((s) =>
                        t(`${s[0].toUpperCase()}${s.slice(1).toLowerCase()}`),
                      )
                      .join(', ')
                  : '-'
              }
            />
          </Grid>
        ))}
      </Grid>
      <Dialog
        title="Edit Appointment Preferences"
        onCancel={() => {
          setOpenDialog(false);
          reset();
        }}
        disableSaveBtn={
          !!(
            !watch('openingHour') ||
            !watch('closingHour') ||
            watch('appointmentDaysOfWeek').length <= 0
          )
        }
        onSave={handleSubmit(onSave)}
        dialogProps={{
          maxWidth: 'xs',
          open: openDialog || false,
        }}>
        <EditAppointmentForm
          watch={watch}
          register={register}
          setValue={setValue}
          defaultValues={getDefaultValues(elevator)}
        />
      </Dialog>
    </InfoCard>
  );
};
