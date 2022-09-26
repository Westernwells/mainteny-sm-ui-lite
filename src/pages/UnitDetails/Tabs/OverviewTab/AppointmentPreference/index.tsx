import useTheme from '@mui/material/styles/useTheme';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
import PermContactCalendar from '@mui/icons-material/PermContactCalendar';
import Cached from '@mui/icons-material/Cached';
import {
  ElevatorView,
  ElevatorProperty,
  ElevatorTimeRuleView,
  ElevatorTimeRuleType,
  DaysTimeRange,
} from 'models/elevator';
import {useTranslation} from 'react-i18next';
import Grid from '@mui/material/Grid';
import {InfoCard} from 'components/InfoCard';
import {useRef, useState} from 'react';
import {useFormik} from 'formik';
import {useUpdateElevator} from 'hooks/reactQuery/useElevator';
import {Dialog} from 'components/Dialog';
import {CardProps} from 'components/CardProps';
import {AppointmentFormModel} from 'models/unitForm';
import * as Yup from 'yup';
import {
  AppointmentPreferenceKey,
  AppointmentPreferenceSchema,
} from './AppointmentPreferenceSchema';
import {EditAppointmentForm, mapDaysOfWeekOptions} from './EditAppointmentForm';
import {StringMap} from '../../../../../models/misc';

interface Props {
  containerStyles?: {[key: string]: any};
  elevator: ElevatorView;
  propertyOwnerId?: string;
}

const makeKeyValueFromArrayOfObjects = (arr: ElevatorProperty[]) => {
  const result: {[key: string]: string} = {};
  arr.forEach((item) => {
    result[item.key] = item.value;
  });
  return result;
};

const validationSchema = Yup.object().shape({});

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
  const propertyRef = useRef(
    makeKeyValueFromArrayOfObjects(elevator.properties || []),
  ).current;

  const formik = useFormik<AppointmentFormModel>({
    initialValues: {
      appointmentDaysOfWeek: propertyRef.appointmentDaysOfWeek
        ? propertyRef.appointmentDaysOfWeek.split(',')
        : [],
      openingHour: propertyRef.openingHours
        ? propertyRef.openingHours.split('-')[0]
        : '',
      closingHour: propertyRef.openingHours
        ? propertyRef.openingHours.split('-')[1]
        : '',
      requiresAppointment: propertyRef.requiresAppointment || '',
      requiresAppointmentNotification:
        propertyRef.requiresAppointmentNotification || '',
      appointmentNotificationDueInDays:
        propertyRef.appointmentNotificationDueInDays,
    },
    onSubmit: () => {},
    validationSchema,
  });

  const onSave = async () => {
    setOpenDialog(false);
    await updateElevator({
      body: {
        propertyOwnerId,
        properties: {
          requiresAppointment: formik.values.requiresAppointment,
          requiresAppointmentNotification:
            formik.values.requiresAppointmentNotification,
          appointmentNotificationDueInDays:
            formik.values.appointmentNotificationDueInDays,
        },
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
      },
      elevatorId: elevator.id,
    });
  };

  const renderTimeRules = (timeRules: ElevatorTimeRuleView[]) => {
    const daysOfWeekAndTimeRangeTimeRule = timeRules.find(
      (timeRule) =>
        timeRule.type === ElevatorTimeRuleType.DAYS_OF_WEEK_AND_TIME_RANGE,
    );
    if (!daysOfWeekAndTimeRangeTimeRule) return null;

    const parsedData = (
      JSON.parse(daysOfWeekAndTimeRangeTimeRule.data) as DaysTimeRange[]
    )[0];

    const removeSecondsFromTimeString = (time: string) =>
      time.slice(0, time.lastIndexOf(':'));

    return (
      <>
        <Grid item xs={12}>
          <CardProps
            icon={<PermContactCalendar sx={{color: theme.palette.info.dark}} />}
            label="DAYS OF THE WEEK"
            bodyText={parsedData.daysOfWeek.join(', ')}
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
              parsedData.timeRange.start,
            )}-${removeSecondsFromTimeString(parsedData.timeRange.end)}`}
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
      <Grid container spacing={1}>
        {elevator?.timeRules.length
          ? renderTimeRules(elevator.timeRules)
          : null}

        {elevator.properties &&
          elevator.properties
            .filter(
              (property) =>
                (AppointmentPreferenceKey as StringMap<string>)[property.key],
            )
            .sort((a, b) => a.key.localeCompare(b.key))
            .map((property) => (
              <Grid key={property.key} item xs={12}>
                <AppointmentPreferenceSchema
                  label={property.key}
                  property={property}
                />
              </Grid>
            ))}
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
