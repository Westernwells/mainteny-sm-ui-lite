import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
import {
  ElevatorView,
  ElevatorProperty,
  ElevatorRequestBody,
} from 'models/elevator';
import Grid from '@mui/material/Grid';
import {InfoCard} from 'components/InfoCard';
import {useRef, useState} from 'react';
import {useFormik} from 'formik';
import {useUpdateElevator} from 'hooks/reactQuery/useElevator';
import {Dialog} from 'components/Dialog';
import {AppointmentFormModel} from 'models/unitForm';
import * as Yup from 'yup';
import {
  AppointmentPreferenceKey,
  AppointmentPreferenceSchema,
} from './AppointmentPreferenceSchema';
import {EditAppointmentForm} from './EditAppointmentForm';
import {StringMap} from '../../../../../models/misc';

interface Props {
  containerStyles?: {[key: string]: any};
  elevator: ElevatorView;
  elevatorRequestBody?: Partial<ElevatorRequestBody>;
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
  elevatorRequestBody,
}: Props) => {
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
        ...elevatorRequestBody,
        properties: {
          ...elevatorRequestBody?.properties,
          appointmentDaysOfWeek: formik.values.appointmentDaysOfWeek.join(','),
          openingHours: `${formik.values.openingHour}-${
            formik.values.closingHour || '17:00'
          }`,
          requiresAppointment: formik.values.requiresAppointment,
          requiresAppointmentNotification:
            formik.values.requiresAppointmentNotification,
          appointmentNotificationDueInDays:
            formik.values.appointmentNotificationDueInDays,
        },
      },
      elevatorId: elevator.id,
    });
  };

  return (
    <InfoCard
      containerStyles={{...containerStyles}}
      handleAction={() => setOpenDialog(true)}
      header={
        <Typography variant="subtitle1">Appointment Preferences</Typography>
      }
      headerActionIcon={<EditIcon />}
      showHeaderBackground>
      <Grid container spacing={1}>
        {elevator.properties &&
          elevator.properties
            .filter(
              (property) =>
                (AppointmentPreferenceKey as StringMap<string>)[property.key],
            )
            .sort((a, b) => a.key.localeCompare(b.key))
            .map((property) => (
              <Grid key={property.key} item xs={12} sm={4} md={6}>
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
