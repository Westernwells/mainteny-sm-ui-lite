import {ServiceOrderView} from 'models/service-order';
import {Typography, useTheme} from '@mui/material';
import {InfoCard} from 'components/InfoCard';
import {ReactComponent as CalendarInformationIcon} from 'assets/icons/CalendarInformationIcon.svg';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import {useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Dialog} from 'components/Dialog';
import Grid from '@mui/material/Grid';
import {AppointmentSchema} from 'pages/UnitDetails/Tabs/OverviewTab/AppointmentPreference/AppointmentShema';
import {
  formatDaysOfWeek,
  formatOpeningHours,
  mapFormDataToElevatorUpdateRequest,
} from 'utils/elevator-utils';
import {AppointmentFormModel} from 'models/unitForm';
import {EditAppointmentForm} from 'pages/UnitDetails/Tabs/OverviewTab/AppointmentPreference/EditAppointmentForm';
import {useUpdateElevator} from 'hooks/reactQuery/useElevator';
import {useUpdateServiceOrder} from 'hooks/reactQuery/useServiceOrder';
import {useAppointmentPreferences} from 'hooks/useAppointmentPreferences';

interface Props {
  order: ServiceOrderView;
}

export const AppointmentPreferences = ({order}: Props) => {
  const {t} = useTranslation();
  const [openDialog, setOpenDialog] = useState(false);
  const {mutateAsync: updateElevator} = useUpdateElevator(
    'Appointment preference updated successfully',
  );
  const {mutate: updateServiceOrder} = useUpdateServiceOrder(
    'Service Order updated successfully',
  );

  const theme = useTheme();

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
  } = useAppointmentPreferences(order.elevator);

  const onSave = async (data: AppointmentFormModel) => {
    setOpenDialog(false);
    await updateElevator(
      mapFormDataToElevatorUpdateRequest(
        data,
        order.elevator.id,
        order.elevator?.propertyOwner.id,
      ),
    );
    updateServiceOrder({
      body: {},
      serviceOrderId: order.id,
    });
  };

  return (
    <InfoCard
      containerStyles={{
        [theme.breakpoints.up('md')]: {
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          '& .MuiCardHeader-root': {
            marginBottom: 0.5,
          },
        },
      }}
      handleAction={() => setOpenDialog(true)}
      headerIcon={
        <CalendarInformationIcon style={{width: '2rem', height: '2rem'}} />
      }
      header={
        <Typography variant="h5">{t('Appointment preferences')}</Typography>
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
            <Grid key={label} item xs={12} md={isDescription ? 6 : 3}>
              <AppointmentSchema
                label={label}
                elevator={order.elevator}
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
