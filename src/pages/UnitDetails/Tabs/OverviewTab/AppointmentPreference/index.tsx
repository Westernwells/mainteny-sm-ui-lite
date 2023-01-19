import useTheme from '@mui/material/styles/useTheme';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
import PermContactCalendar from '@mui/icons-material/PermContactCalendar';
import FlagIcon from '@mui/icons-material/Flag';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import Cached from '@mui/icons-material/Cached';
import {
  ElevatorView,
  ElevatorTimeRuleView,
  ElevatorTimeRuleType,
  DaysTimeRange,
} from 'models/elevator';
import {useTranslation} from 'react-i18next';
import Grid from '@mui/material/Grid';
import {InfoCard} from 'components/InfoCard';
import {useState} from 'react';
import {useFormik} from 'formik';
import {useUpdateElevator} from 'hooks/reactQuery/useElevator';
import {titleCase} from 'utils/utils';
import {Dialog} from 'components/Dialog';
import {CardProps} from 'components/CardProps';
import {AppointmentFormModel} from 'models/unitForm';
import * as Yup from 'yup';
import {EditAppointmentForm, mapDaysOfWeekOptions} from './EditAppointmentForm';

interface Props {
  containerStyles?: {[key: string]: any};
  elevator: ElevatorView;
  propertyOwnerId?: string;
}

const validationSchema = Yup.object().shape({});

const parseTimeRulesData = (timeRules: ElevatorTimeRuleView[]) => {
  const daysOfWeekAndTimeRangeTimeRule = timeRules.find(
    (timeRule) =>
      timeRule.type === ElevatorTimeRuleType.DAYS_OF_WEEK_AND_TIME_RANGE,
  );
  if (!daysOfWeekAndTimeRangeTimeRule) return null;

  const parsedData = (
    JSON.parse(daysOfWeekAndTimeRangeTimeRule.data) as DaysTimeRange[]
  )[0];

  return parsedData;
};

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

  const formik = useFormik<AppointmentFormModel>({
    initialValues: {
      appointmentDaysOfWeek:
        parsedTimeRulesData?.daysOfWeek.map((val) => titleCase(val)) ?? [],
      openingHour: parsedTimeRulesData?.timeRange.start ?? '',
      closingHour: parsedTimeRulesData?.timeRange.end ?? '',
      shouldNotifyCustomer:
        elevator.additionalInfo?.customerAppointment?.shouldNotifyCustomer ??
        true,
      appointmentNotificationDue:
        elevator.additionalInfo?.customerAppointment
          ?.appointmentNotificationDue ?? 0,
    },
    onSubmit: () => {},
    validationSchema,
  });

  const onSave = async () => {
    setOpenDialog(false);
    await updateElevator({
      body: {
        propertyOwnerId,
        ...(formik.values.openingHour &&
          formik.values.closingHour && {
            timeRule: {
              daysTimeRange: [
                {
                  daysOfWeek: formik.values.appointmentDaysOfWeek.map((val) =>
                    mapDaysOfWeekOptions[
                      val as keyof typeof mapDaysOfWeekOptions
                    ].toUpperCase(),
                  ),
                  timeRange: {
                    start: formik.values.openingHour || '',
                    end: formik.values.closingHour || '',
                  },
                },
              ],
            },
          }),
        customerAppointment: {
          shouldNotifyCustomer: formik.values.shouldNotifyCustomer,
          appointmentNotificationDue: formik.values.appointmentNotificationDue,
        },
      },
      elevatorId: elevator.id,
    });
  };

  const renderTimeRules = () => {
    if (!parsedTimeRulesData) return null;

    const removeSecondsFromTimeString = (time: string) =>
      time.slice(0, time.lastIndexOf(':'));

    return (
      <>
        <Grid item xs={12}>
          <CardProps
            icon={<PermContactCalendar sx={{color: theme.palette.info.dark}} />}
            label="DAYS OF THE WEEK"
            bodyText={
              parsedTimeRulesData.daysOfWeek
                ? parsedTimeRulesData.daysOfWeek
                    .map((s) =>
                      t(`${s[0].toUpperCase()}${s.slice(1).toLowerCase()}`),
                    )
                    .join(', ')
                : '-'
            }
            iconBackground={theme.palette.info.outlinedHoverBg}
            containerStyles={{mt: '0.5em'}}
            iconMaxHeight="3em"
          />
        </Grid>
        <Grid item xs={12}>
          <CardProps
            icon={<Cached sx={{color: theme.palette.info.dark}} />}
            label="OPENING HOURS"
            bodyText={`${removeSecondsFromTimeString(
              parsedTimeRulesData.timeRange.start,
            )}-${removeSecondsFromTimeString(
              parsedTimeRulesData.timeRange.end,
            )}`}
            iconBackground={theme.palette.info.outlinedHoverBg}
            containerStyles={{mt: '0.5em'}}
            iconMaxHeight="3em"
          />
        </Grid>
      </>
    );
  };

  return (
    <InfoCard
      containerStyles={{...containerStyles}}
      handleAction={() => setOpenDialog(true)}
      header={
        <Typography variant="subtitle1">
          {t('Appointment Preferences')}
        </Typography>
      }
      headerActionIcon={<EditIcon />}
      showHeaderBackground
      bodyContainerStyle={{
        overflowY: 'auto',
      }}>
      <Grid container spacing={2}>
        {elevator?.timeRules.length ? renderTimeRules() : null}

        <Grid item xs={12}>
          <CardProps
            icon={<FlagIcon sx={{color: theme.palette.info.dark}} />}
            label="NOTIFICATION DUE"
            bodyText={
              elevator?.additionalInfo?.customerAppointment
                ?.appointmentNotificationDue ?? '-'
            }
            iconBackground={theme.palette.info.outlinedHoverBg}
            containerStyles={{mt: '0.5em'}}
            iconMaxHeight="3em"
          />
        </Grid>
        <Grid item xs={12}>
          <CardProps
            icon={
              <AccessTimeFilledIcon sx={{color: theme.palette.info.dark}} />
            }
            label="REQUIRES NOTIFICATION"
            bodyText={
              elevator?.additionalInfo?.customerAppointment
                ?.shouldNotifyCustomer
                ? t('YES')
                : t('NO')
            }
            iconBackground={theme.palette.info.outlinedHoverBg}
            containerStyles={{mt: '0.5em'}}
            iconMaxHeight="3em"
          />
        </Grid>
      </Grid>
      <Dialog
        title="Edit Appointment Preferences"
        onCancel={() => setOpenDialog(false)}
        disableSaveBtn={!!Object.keys(formik.errors).length}
        onSave={() => onSave()}
        dialogProps={{
          maxWidth: 'xs',
          open: openDialog || false,
        }}>
        <EditAppointmentForm formik={formik} />
      </Dialog>
    </InfoCard>
  );
};
