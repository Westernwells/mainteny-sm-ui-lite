import {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import useTheme from '@mui/material/styles/useTheme';
import {ElevatorView} from 'models/elevator';
import {InfoCard} from 'components/InfoCard';
import EditOutlined from '@mui/icons-material/EditOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import {Dialog} from 'components/Dialog';
import {useForm} from 'react-hook-form';
import {TechnicalDataFormModel} from 'models/unitForm';
import {useUpdateElevator} from 'hooks/reactQuery/useElevator';
import TechnicalDataSchema from './TechnicalDataShema';
import EditTechnicalDataForm from './EditTechnicalDataForm';

interface Props {
  elevator: ElevatorView;
}

const TechnicalData = ({elevator}: Props) => {
  const propertyOwnerId = elevator?.propertyOwner?.id;
  const {t} = useTranslation();
  const theme = useTheme();
  const {mutateAsync: updateElevator} = useUpdateElevator(
    'Unit details updated successfully',
  );

  const [openDialog, setOpenDialog] = useState(false);

  const getDefaultValues = (elevatorData: ElevatorView) => ({
    numberOfStops: Number(elevatorData.additionalInfo.numberOfStops),
    drive: elevatorData.additionalInfo.drive,
    capacity: elevatorData.capacity,
    speed: elevatorData.additionalInfo.speed,
    controller: elevator.additionalInfo.controller,
    iotDevice: elevator.additionalInfo.iotDevice,
    cabinType: elevatorData.additionalInfo.cabinType,
    cageWeight: elevator.additionalInfo.cageWeight,
    counterWeight: elevator.additionalInfo.counterWeight,
    hoistingHeight: elevator.additionalInfo.hoistingHeight,
    shaftHeight: elevator.additionalInfo.shaftHeight,
    numberOfPeople: elevator.additionalInfo.numberOfPeople,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: {errors},
  } = useForm<TechnicalDataFormModel>({
    defaultValues: getDefaultValues(elevator),
  });
  useEffect(() => {
    reset(getDefaultValues(elevator));
  }, [elevator]);

  const labels = useRef([
    'stops',
    'drive',
    'capacity',
    'speed',
    'controller',
    'iotDevice',
    'cabinType',
    'cageWeight',
    'counterWeight',
    'hoistingHeight',
    'shaftHeight',
    'numberOfPeople',
  ]).current;

  const onSubmit = async (data: TechnicalDataFormModel) => {
    setOpenDialog(false);
    await updateElevator({
      body: {
        propertyOwnerId,
        capacity: String(data.capacity),
        numberOfStops: data.numberOfStops,
        drive: data.drive,
        speed: String(data.speed),
        cabinType: data.cabinType,
        cageWeight: data.cageWeight,
        counterWeight: data.counterWeight,
        hoistingHeight: data.hoistingHeight,
        shaftHeight: data.shaftHeight,
        controller: data.controller,
        iotDevice: data.iotDevice,
        numberOfPeople: data.numberOfPeople,
      },
      elevatorId: elevator.id,
    });
  };

  return (
    <InfoCard
      handleAction={() => setOpenDialog(true)}
      headerActionIcon={
        <EditOutlined style={{color: theme.palette.secondary.mainLight}} />
      }
      header={
        <Grid container wrap="nowrap" gap={1}>
          <SettingsOutlinedIcon
            style={{
              transform: 'rotate(45deg)',
              color: theme.palette.text.secondary,
            }}
          />
          <Typography variant="h5" fontWeight={600}>
            {t('Technical Data')}
          </Typography>
        </Grid>
      }>
      <Grid container spacing={2}>
        {labels.map((label) => (
          <Grid key={label} item xs={12} sm={4} md={4}>
            <TechnicalDataSchema label={label} elevator={elevator} />
          </Grid>
        ))}
      </Grid>
      <Dialog
        title="Edit Technical Data"
        onCancel={() => {
          reset();
          setOpenDialog(false);
        }}
        disableSaveBtn={!!Object.keys(errors).length}
        onSave={handleSubmit(onSubmit)}
        dialogProps={{
          maxWidth: 'md',
          open: openDialog || false,
        }}>
        <EditTechnicalDataForm register={register} />
      </Dialog>
    </InfoCard>
  );
};

export default TechnicalData;
