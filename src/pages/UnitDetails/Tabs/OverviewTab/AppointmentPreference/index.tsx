import Typography from '@mui/material/Typography';
// import useTheme from '@mui/material/styles/useTheme';
import EditIcon from '@mui/icons-material/Edit';
import {Elevator, ElevatorProperty, ElevatorRequestBody} from 'models/elevator';
import Grid from '@mui/material/Grid';
import {InfoCard} from 'components/InfoCard';
import {useRef, useState} from 'react';
import {useFormik} from 'formik';
import {useUpdateElevator} from 'hooks/reactQuery/useElevator';
import {Dialog} from 'components/Dialog';
import * as Yup from 'yup';
import {AppointmentFormModel} from '../models';
import {AppointmentPreferenceSchema} from './AppointmentPreferenceSchema';
import {EditAppointmentForm} from './EditAppointment';

interface Props {
  containerStyles?: {[key: string]: any};
  elevator: Elevator;
  elevatorRequestBody?: Partial<ElevatorRequestBody>;
}

const makeKeyValueFromArrayOfObjects = (arr: ElevatorProperty[]) => {
  const result: {[key: string]: string} = {};
  arr.forEach((item) => {
    result[item.key] = item.value;
  });
  return result;
};

const validationSchema = Yup.object().shape({
  lastVisitDate: Yup.string().nullable().required('Last visit is required'),
  serviceTime: Yup.string().nullable().required('Service time is required'),
  technicianNumber: Yup.number()
    .nullable()
    .required('No. of technicians is required'),
});

export const AppointmentPreference = ({
  containerStyles,
  elevator,
  elevatorRequestBody,
}: Props) => {
  // const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const {mutateAsync: updateElevator} = useUpdateElevator(
    'Appointment preference updated successfully',
  );
  const propertyRef = useRef(
    makeKeyValueFromArrayOfObjects(elevator.properties),
  ).current;

  const formik = useFormik<AppointmentFormModel>({
    initialValues: {
      appointmentDaysOfWeek: propertyRef.appointmentDaysOfWeek
        ? propertyRef.appointmentDaysOfWeek.split(',')
        : [],
      openingHours: propertyRef.openingHours,
      requiresAppointment: propertyRef.openingHours,
      requiresAppointmentNotification: propertyRef.openingHours,
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
          openingHours: formik.values.openingHours,
          requiresAppointment: formik.values.openingHours,
          requiresAppointmentNotification: formik.values.openingHours,
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
      <Grid container spacing={2}>
        {elevator.properties.map((property) => (
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
