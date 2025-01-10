import useTheme from '@mui/material/styles/useTheme';
import Typography from '@mui/material/Typography';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import {ReactComponent as CalendarInformationIcon} from 'assets/icons/CalendarInformationIcon.svg';
import {ElevatorView} from 'models/elevator';
import {useTranslation} from 'react-i18next';
import Grid from '@mui/material/Grid';
import {InfoCard} from 'components/InfoCard';
import {useRef, useState} from 'react';
import {useUpdateElevator} from 'hooks/reactQuery/useElevator';
import {Dialog} from 'components/Dialog';
import {AppointmentFormModel} from 'models/unitForm';
import {
  formatDaysOfWeek,
  formatOpeningHours,
  mapFormDataToElevatorUpdateRequest,
} from 'utils/elevator-utils';
import {useAppointmentPreferences} from 'hooks/useAppointmentPreferences';
import {EditAppointmentForm} from './EditAppointmentForm';
import {AppointmentSchema} from './AppointmentShema';

interface Props {
  containerStyles?: {[key: string]: any};
  elevator: ElevatorView;
  propertyOwnerId?: string;
}

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

  const labels = useRef([
    'daysOfWeek',
    'openingHours',
    'requiresAppointment',
    'contactPerson',
    'requiresNotification',
    'notificationDue',
    'description',
  ]).current;

  const {
    watch,
    register,
    handleSubmit,
    setValue,
    reset,
    disableSaveBtn,
    parsedTimeRulesData,
    getDefaultValues,
  } = useAppointmentPreferences(elevator);

  const onSave = async (data: AppointmentFormModel) => {
    setOpenDialog(false);
    await updateElevator(
      mapFormDataToElevatorUpdateRequest(data, elevator.id, propertyOwnerId),
    );
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
        {labels.map((label) => {
          const isDescription = label === 'description';
          return (
            <Grid key={label} item xs={12} md={isDescription ? 12 : 4}>
              <AppointmentSchema
                label={label}
                elevator={elevator}
                openingHours={formatOpeningHours(
                  parsedTimeRulesData?.timeRange,
                )}
                daysOfWeek={formatDaysOfWeek(parsedTimeRulesData?.daysOfWeek)}
              />
            </Grid>
          );
        })}
      </Grid>

      <Dialog
        dataTestId="appointment-preferences-dialog"
        title="Edit Appointment Preferences"
        onCancel={() => {
          setOpenDialog(false);
          reset();
        }}
        disableSaveBtn={disableSaveBtn}
        onSave={handleSubmit(onSave)}
        dialogProps={{
          maxWidth: 'sm',
          open: openDialog || false,
        }}>
        <EditAppointmentForm
          watch={watch}
          register={register}
          setValue={setValue}
          defaultValues={getDefaultValues()}
        />
      </Dialog>
    </InfoCard>
  );
};
